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
import {UserEntity} from "../user/entity";

export class SocketServer extends EventEmitter {

  private server:SocketIO.Server;
  private connections:{[key:number]:SocketConnection[]} = {};

  constructor(private userApi:UserApi, httpServer:http.Server, private events:string[] = []) {
    super();
    this.server = socket(httpServer);

    this.initSocketServer();
  }

  close():void {
    this.removeAllListeners();

    var sockets = _.flattenDeep<SocketConnection>(_.values<SocketConnection[]>(this.connections));

    sockets.forEach((s:SocketConnection) => {
      s.socket.emit('hermes:shutdown');
      s.socket.disconnect(true);
      s.destroy();
    });
  }

  private initSocketServer():void {
    this.server.on('connection', this.onConnection.bind(this));
  }

  private onConnection(socket:SocketIO.Socket):void {
    socket.once('user:authenticate', this.onUserAuthenticate.bind(this, socket));
  }

  private onUserAuthenticate(socket:SocketIO.Socket, accessToken:string):void {
    this
      .userApi
      .authenticate(accessToken)
      .then(this.onAuthenticationSuccess.bind(this, socket, true))
      .catch(this.onAuthenticationFailed.bind(this, socket, false));
  }

  private onAuthenticationSuccess(user:UserEntity, socket:SocketIO.Socket):void {
    var connection = new SocketConnection(socket, user, this.events);
    connection.once('connection:closed', this.onConnectionClosed.bind(this, connection));

    if (!this.connections[user.id]) {
      this.connections[user.id] = [];

      this.emit('new:connection', connection);
    } else {
      this.emit('new:socket', connection);
    }

    this.connections[user.id].push(connection);

    this.notifyAuthenticationResult(socket, true);
  }

  private onAuthenticationFailed(socket:SocketIO.Socket) {
    socket.once('user:authenticate', this.onUserAuthenticate.bind(this, socket));

    this.notifyAuthenticationResult(socket, false);
  }

  private notifyAuthenticationResult(socket:SocketIO.Socket, success:boolean) {
    this.emit('user:authenticate', {success: success});
    socket.emit('user:authenticate', {success: success});
  }

  private onConnectionClosed(connection:SocketConnection) {
    var user = connection.user;

    if (!this.connections[user.id]) {
      return;
    }

    this.connections[user.id] = _.reject(this.connections[user.id], (s:SocketConnection) => s === connection);
    connection.destroy();

    var socket = connection.socket;

    if (socket.connected) {
      socket.once('user:authenticate', this.onUserAuthenticate.bind(this));
    }

    if (this.connections[user.id].length === 0) {
      delete this.connections[user.id];
    }
  }
}
