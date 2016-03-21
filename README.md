# Node Hermes
A node library written in Typescript, used for communication between front- & backend. 
Communication between backend and Hermes is done over Redis and communication between frontend and Hermes is done using sockets.

## Usage
Basic example of spawning a Hermes instance.
```javascript
var httpConfig = {
  listenOnPort: 5000
};

var apiConfig = {
  baseUri: 'api.test.dev',
  apiToken: 'testToken'
};

var socketServerConfig = {
  events: []
};

var redisConfig = {
  initialSubscribes: ['test1', 'test2']
};

var hermes = new Hermes(httpConfig, apiConfig, socketServerConfig, redisConfig);

hermes.run();

```

## Components
Hermes contains the following components:

### Http server
A basic http server.

#### Configuration
The only configurable parameter for the http server is the `listenOnPort` parameter.

### Redis connection
Two connections to a Redis instance; one subscriber and one publisher. 
See `src/lib/redis/redis-connection.ts` for details.

#### Usage
Example of subscribing, unsubscribing and publishing to Redis:
```javascript
// Spawn a Hermes instance, see Usage section

var redisConnection:RedisConnection = hermes.redisConnection;

// Start listening for a Redis event
redisConnection.subscribe('test-channel');

// Stop listening on a Redis event
redisConnection.unsubscribe('test-channel');

// Send an event over Redis
redisConnection.publish('test-channel', {data: 'some interesting data'});
```

Example of handling incoming event over Redis:
```javascript
// Spawn a Hermes instance, see Usage section

var redisConnection:RedisConnection = hermes.redisConnection;

redisConnection.subscribe('test-event');

// Handle incoming event
redisConnection.on('test-event', (data:any) => console.log(data);
```

#### Configuration
The redis connection is configurable when spawning Hermes. All parameters are `optional`.
- `port` the port used by your Redis server, default `6379`
- `host` the host name used by your Redis server, default `localhost`
- `initialSubscribes` a list of Redis events to subscribe to after Redis connection has been established, default `[]`
- `connectionConfig` config object passed to package `redis` when connection is created

#### Events
The following events are triggered by the Redis connection:
- `redis:subscriber:connected` triggered when subscriber channel is established
- `redis:publisher:connected` triggered when publisher channel is established
- `redis:subscriber:subscribed` triggered when the subscriber successfully subscribed to an event
- `redis:subscriber:unsubscribed` triggered when the subscriber successfully unsubscribed from an event
- `redis:connection:error` triggered when we receive a Redis error
- `<event-name>` triggered when there's an incoming event over Redis we are subscribed to

### Socket server
A SocketIO server listening for incoming socket connections.

#### Authentication
Hermes authenticates every incoming connection by listening to a `user:authenticate`
event being sent through the socket. The provided access token is then sent to
a configurable api uri (see `Configuration`) to validate the access token.

Note: Hermes will only handle one `user:authenticate` event at a time from a specific socket.

##### Successful
If the user is authenticated, Hermes will respond with a `user:authenticate` event
over the same socket with data `{success: true}` and also add the socket to the system.
After successful authentication, all configured events (see `Configuration`) will be
handled.

To unregister from the system. The socket must either disconnect or a `user:logout` event
must be sent over the socket.

##### Failed
If authentication fails, Hermes will respond with a `user:authenticate` event
over the same socket with data `{success: false}`. If max attempts are exceeded Hermes
sends a `socket:closed` event and then disconnects the socket.

#### Usage
Basic usage of the Socket Server
```javascript
// Spawn Hermes instance
var socketServer:SocketServer = hermes.socketServer;
socketServer.on('new:user', (connection:SocketConnection) => {
    connection.on('test-event', (data:any) => console.log(data));
});

// socket is an incoming connection to Hermes
socket.emit('user:authenticate', 'access-token');
// Hermes will now respond with {'success': true} and internally trigger the 'new:connection' event

socket.emit('test-event', {data: 'important stuff'});
// {data: 'important stuff'} is now written in the console

// Unregister from Hermes
socket.emit('user:logout');
```

#### Configuration
The socket server is configurable when spawning Hermes.
- `events` a list of events that the system should handle, default `[]`
- `maxAuthenticateAttempts` number of times a socket is allowed to fail authentication before
it is disconnected, default `infinite`

#### Events
Events triggered by the Socket server:
- `new:connection` triggered when a new user connects to the system
- `new:socket` triggered when an existing user connects with another socket
- `user:authenticate` triggered when an authentication has been processed


### User Api
A user api component used to authenticate a user against a given backend.

#### Configuration
The following parameters are available to be configured:
- `baseUri` the base uri of the api, mandatory.
- `apiToken` the token sent in the authorization header by Hermes to the backend
- `authenticationUri` uri used to authenticate and retrieve the user by Hermes, default `/users/me`

## License
todo
