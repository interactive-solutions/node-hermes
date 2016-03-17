/**
 * @author Erik Norgren <erik.norgren@interactivesolutions.se>
 * @copyright Interactive Solutions
 */

import {EventEmitter} from "events";
import {UserEntity} from "../user/entity";

export class SocketConnection extends EventEmitter {
  constructor(private _socket:SocketIO.Socket, private _user:UserEntity, private events:string[]) {
    super();
    this.initConnection();
  }

  get socket():SocketIO.Socket {
    return this._socket;
  }

  get user():UserEntity {
    return this._user;
  }

  destroy():void {
    this.removeAllListeners();
  }

  private initConnection():void {
    this.socket.once('user:logout', this.onUserLogout.bind(this));
    this.socket.once('disconnect', this.onDisconnect.bind(this));

    this.events.forEach((e:string) => this.socket.on(e, this.onEvent.bind(this, e)));
  }

  private onEvent(e:string,...args):void {
    this.emit(e, this,...args);
  }

  private onUserLogout():void {
    this.emit('connection:closed');
  }

  private onDisconnect():void {
    this.emit('connection:closed');
  }
}
