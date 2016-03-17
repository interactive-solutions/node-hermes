///<reference path='../typings/browser.d.ts'/>

/**
 * @author Erik Norgren <erik.norgren@interactivesolutions.se>
 * @copyright Interactive Solutions
 */

import * as http from 'http';
import * as redis from 'redis';
import * as socket from 'socket.io';

import {SocketServer} from "./lib/socket/socket-server";
import {RedisConnection} from "./lib/redis/redis-connection";
import {ClientOpts} from "redis";
import {UserApi} from "./lib/api/user";

export class Hermes {

  // Api related
  private userApi:UserApi;

  // Socket related
  private server:http.Server;
  private socketServer:SocketServer;

  // Redis related
  private redisConnection:RedisConnection;

  constructor(private listenOnPort:number,
              private apiUri:string,
              private apiToken = null,
              socketEvents:string[],
              redisHost:string,
              redisPort:number = 6379,
              redisConfig:ClientOpts = {},
              redisChannels:string[] = []) {
    this.userApi = new UserApi(apiUri, apiToken);

    this.server = http.createServer();
    this.socketServer = new SocketServer(this.userApi, this.server, socketEvents);

    this.redisConnection = new RedisConnection(redisHost, redisPort, redisConfig, redisChannels);

    this.init();
  }

  run():void {
    // Initiate the web-socket server
    this.server.listen(this.listenOnPort, () => {
      console.log(`Running process with pid: ${process.pid}`);
      console.log(`Listening on port: ${this.listenOnPort}`)
    });
  }

  private init():void {
    process.on('SIGINT', this.onShutdown.bind(this));
    process.on('SIGTERM', this.onShutdown.bind(this));
  }

  private onShutdown():void {
    console.log('Initiating shutdown...');

    this.socketServer.close();
    this.redisConnection.disconnect();

    this.server.close(() => process.exit());
  }
}
