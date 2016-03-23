/**
 * @author Erik Norgren <erik.norgren@interactivesolutions.se>
 * @copyright Interactive Solutions
 */

import * as socket from 'socket.io';
import * as http from 'http';
import * as _ from 'lodash';

import {EventEmitter} from "events";
import {UserApi} from "../api/user";
import {SocketConnection} from "./socket-connection";
import {UserEntity} from "../user/user";
import {UserCollection} from "../user/user";

export interface SocketServerConfig {
  events:string[];
  maxAuthenticateAttempts?:number;
}

interface AuthenticationFailedSocket extends SocketIO.Socket {
  attempts:number;
}

export class SocketServer extends EventEmitter {

  private server:SocketIO.Server;
  private _connections:{[key:number]:SocketConnection[]} = {};

  constructor(private userApi:UserApi,
              private users:UserCollection,
              private config:SocketServerConfig,
              httpServer:http.Server) {
    super();
    this.server = socket.listen(httpServer);

    this.initSocketServer();
  }

  get connections():SocketConnection[] {
    return _.flattenDeep<SocketConnection>(_.values<SocketConnection[]>(this._connections));
  }

  close():void {
    this.removeAllListeners();

    this.connections.forEach((s:SocketConnection) => {
      s.socket.emit('hermes:shutdown');
      s.socket.disconnect(true);
      s.destroy();
    });
  }

  private initSocketServer():void {
    this.server.sockets.on('connection', this.onConnection.bind(this));
  }

  private onConnection(socket:SocketIO.Socket):void {
    socket.once('user:authenticate', this.onUserAuthenticate.bind(this, socket));
  }

  private onUserAuthenticate(socket:SocketIO.Socket, accessToken:string):void {
    this
      .userApi
      .authenticate(accessToken)
      .then(this.onAuthenticationSuccess.bind(this, socket))
      .catch(this.onAuthenticationFailed.bind(this, socket));
  }

  private onAuthenticationSuccess(socket:SocketIO.Socket, u:UserEntity):void {
    var user = this.users.has(u.id) ? this.users.get(u.id) : u;

    var connection = new SocketConnection(socket, user, this.config.events);
    connection.once('connection:closed', this.onConnectionClosed.bind(this, connection));

    if (!this._connections[user.id]) {
      this._connections[user.id] = [];

      this.users.add(user);
      this.emit('new:user', connection);
    } else {
      this.emit('new:socket', connection);
    }

    this._connections[user.id].push(connection);

    this.notifyAuthenticationResult(socket, true);
  }

  private onAuthenticationFailed(socket:AuthenticationFailedSocket):void {
    socket.attempts = socket.attempts ? ++socket.attempts : 1;

    if (this.config.maxAuthenticateAttempts && socket.attempts > this.config.maxAuthenticateAttempts - 1) {
      this.notifyAuthenticationResult(socket, false);
      socket.emit('socket:closed', {reason: 'Maximum authentication attempts reached'});
      socket.disconnect(true);

      return;
    }

    socket.once('user:authenticate', this.onUserAuthenticate.bind(this, socket));

    this.notifyAuthenticationResult(socket, false);
  }

  private notifyAuthenticationResult(socket:SocketIO.Socket, success:boolean) {
    this.emit('user:authenticated', {success: success});
    socket.emit('user:authenticated', {success: success});
  }

  private onConnectionClosed(connection:SocketConnection) {
    var user = connection.user;

    if (!this._connections[user.id]) {
      return;
    }

    this._connections[user.id] = _.reject(this._connections[user.id], (s:SocketConnection) => s === connection);
    connection.destroy();

    var socket = connection.socket;

    if (socket.connected) {
      socket.once('user:authenticate', this.onUserAuthenticate.bind(this));
    }

    if (this._connections[user.id].length === 0) {
      delete this._connections[user.id];
    }
  }
}
