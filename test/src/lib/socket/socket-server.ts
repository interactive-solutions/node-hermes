/**
 * @author Erik Norgren <erik.norgren@interactivesolutions.se>
 * @copyright Interactive Solutions
 */

import * as chai from 'chai';
import * as http from 'http';
import * as socket from 'socket.io';
import * as client from 'socket.io-client';
import {SocketServer} from "../../../../src/lib/socket/socket-server";
import {MockUserApi} from "../../mock/user-api";
import {UserCollection} from "../../../../src/lib/user/user";
import {SocketConnection} from "../../../../src/lib/socket/socket-connection";

describe('Socket server', () => {
  var api:any;
  var server:SocketServer;
  var users:UserCollection;
  var httpServer:http.Server;
  var webSocket:SocketIOClient.Socket;

  beforeEach(() => {
    users = new UserCollection();
    httpServer = http.createServer();

    api = new MockUserApi();
    server = new SocketServer(api, users, {
      events: ['event-1', 'event-2'],
      maxAuthenticateAttempts: 3
    }, httpServer);

    httpServer.listen(5000);

    webSocket = client.connect('http://localhost:5000');
  });

  afterEach(() => {
    server.close();
    httpServer.close();
  });

  it('Should send authentication success to user on successful authentication', (done) => {
    webSocket.on('user:authenticate', (data:any) => {
      chai.assert.isTrue(data.success);

      done();
    });

    webSocket.emit('user:authenticate', 'valid-access-token');
  });

  it('Should send authentication failed to user on failed authentication', (done) => {
    webSocket.on('user:authenticate', (data:any) => {
      chai.assert.isFalse(data.success);

      done();
    });

    webSocket.emit('user:authenticate', 'invalid-access-token');
  });

  it('Should trigger user authentication event on user authenticate', (done) => {
    server.on('user:authenticate', (data:any) => {
      chai.assert.isDefined(data.success);

      done();
    });

    webSocket.emit('user:authenticate', 'valid-access-token');
  });

  it('Should trigger new user event on new user successful authenticate', (done) => {
    server.on('new:user', (connection:SocketConnection) => {
      chai.assert.equal(connection.user.id, 1);
      chai.assert.equal(webSocket, connection.socket);

      done();
    });

    webSocket.emit('user:authenticate', 'valid-access-token');
  });

  it('Should trigger new socket event on existing user successful authenticate', (done) => {
    var webSocketTwo = client.connect('http://localhost:5000');

    server.on('new:user', (connection:SocketConnection) => {
      chai.assert.equal(connection.user.id, 1);
      chai.assert.equal(webSocket, connection.socket);
    });

    server.on('new:socket', (connection:SocketConnection) => {
      chai.assert.equal(connection.user.id, 1);
      chai.assert.equal(webSocket, connection.socket);

      webSocketTwo.close();

      done();
    });

    webSocket.emit('user:authenticate', 'valid-access-token');
    webSocketTwo.emit('user:authenticate', 'valid-access-token');
  });

  it('Should send socket closed to user if max authentication attempts are reached', (done) => {

  });

  it('Should add a user on new user successful authentication', (done) => {

  });

  it('Should send hermes shutdown event to user on hermes shutdown', (done) => {

  });
});
