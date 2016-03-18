/**
 * @author Erik Norgren <erik.norgren@interactivesolutions.se>
 * @copyright Interactive Solutions
 */

import * as http from 'http';
import * as redis from 'redis';
import * as socket from 'socket.io';

import {SocketServer, SocketServerConfig} from "./lib/socket/socket-server";
import {RedisConnection, RedisConfig} from "./lib/redis/redis-connection";
import {UserApi} from "./lib/api/user";
import {ApiConfig} from "./lib/api/index";
import {UserCollection} from "./lib/user/user";

export interface HttpConfig {
  listenOnPort:number;
}

export class Hermes {

  // Api related
  private userApi:UserApi;

  // Socket related
  private server:http.Server;
  private _socketServer:SocketServer;

  // Redis related
  private _redisConnection:RedisConnection;

  private _users:UserCollection;

  constructor(private httpConfig:HttpConfig,
              private apiConfig:ApiConfig,
              private socketConfig:SocketServerConfig,
              private redisConfig:RedisConfig) {
    this._users = new UserCollection();

    this.userApi = new UserApi(apiConfig);

    this.server = http.createServer();
    this._socketServer = new SocketServer(this.userApi, this._users, this.socketConfig, this.server);

    this._redisConnection = new RedisConnection(redisConfig);

    this.init();
  }

  get users():UserCollection {
    return this._users;
  }

  get socketServer():SocketServer {
    return this._socketServer;
  }

  get redisConnection():RedisConnection {
    return this._redisConnection;
  }

  run():void {
    // Initiate the web-socket server
    this.server.listen(this.httpConfig.listenOnPort, () => {
      console.log(`Running process with pid: ${process.pid}`);
      console.log(`Listening on port: ${this.httpConfig.listenOnPort}`)
    });
  }

  private init():void {
    process.on('SIGINT', this.onShutdown.bind(this));
    process.on('SIGTERM', this.onShutdown.bind(this));
  }

  private onShutdown():void {
    console.log('Initiating shutdown...');

    this._socketServer.close();
    this._redisConnection.disconnect();

    this.server.close(() => process.exit());
  }
}
