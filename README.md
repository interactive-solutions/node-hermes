# Node Hermes
A node library written in Typescript, used for communication between front- & backend. 
Communication between backend and Hermes is done over Redis and communication between frontend and Hermes is done using sockets.

## Usage
Basic example of spawning a Hermes instance.
```javascript
var hermesConfig = {
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

var hermes = new Hermes(hermesConfig, apiConfig, socketServerConfig, redisConfig);

hermes.run();

```

## Components
Hermes contains the following components:

### Http server
A basic http server.

### Redis connection
Two connections to a Redis instance; one subscriber and one publisher. See `src/lib/redis/redis-connection.ts` for details.

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

// Handle incoming event
redisConnection.on('test-event', (data:any) => do stuff);
```

#### Configuration
The redis connection is configurable when spawning Hermes. All parameters are `optional`.
- `port` the port used by your Redis server, default `6379`
- `host` the host name used by your Redis server, default `localhost`
- `initialSubscribes` a list of Redis events to subscribe to after Redis connection has been established, default `[]`
- `connectionConfig` config object passed to package `redis` when connection is created

#### Events

### Socket server
A SocketIO server listening for incoming socket connections.

## Configuration

## License
todo
