/**
 * @author Erik Norgren <erik.norgren@interactivesolutions.se>
 * @copyright Interactive Solutions
 */

import * as chai from 'chai';
import {SocketConnection} from "../../../../src/lib/socket/socket-connection";
import {UserEntity} from "../../../../src/lib/user/user";
import {MockSocketIO} from "../../mock/socket-io";

describe('Socket connection', () => {
  var socket:any;
  var connection:SocketConnection;

  beforeEach(() => {
    socket = new MockSocketIO();
    connection = new SocketConnection(socket, new UserEntity(1), ['event-1', 'event-2']);
  });

  afterEach(() => {
    socket.removeAllListeners();
    connection.destroy();
  });

  it('Should trigger connection closed event on user logout', (done) => {
    connection.on('connection:closed', () => {
      done();
    });

    socket.emit('user:logout');
  });

  it('Should trigger connection closed event on socket disconnect', (done) => {
    connection.on('connection:closed', () => {
      done();
    });

    socket.emit('disconnect');
  });

  it('Should trigger a custom event that is registered', (done) => {
    connection.on('event-1', (data:any) => {
      chai.assert.deepEqual({
        int: 1,
        string: '123',
        object: {
          id: 1
        }
      }, data);

      done();
    });

    socket.emit('event-1', {
      int: 1,
      string: '123',
      object: {
        id: 1
      }
    });
  });

  it('Should not trigger a custom event that is not registered', (done) => {
    connection.on('event-3', () => {
      chai.assert.isTrue(false);
    });

    setTimeout(() => done(), 300);

    socket.emit('event-3', {
      int: 1,
      string: '123',
      object: {
        id: 1
      }
    });
  });
});
