/**
 * @author Erik Norgren <erik.norgren@interactivesolutions.se>
 * @copyright Interactive Solutions
 */

import {EventEmitter} from "events";
import {RedisClient, createClient, ClientOpts} from "redis";
import * as _ from'lodash';

export interface RedisConfig {
  port?:number;
  host?:string;
  initialSubscribes?:string[];
  connectionConfig?:ClientOpts;
}

/**
 * Wrapper around a bidirectional Redis connection
 */
export class RedisConnection extends EventEmitter {

  /**
   * A redis client used for publishing
   */
  private publisher:RedisClient;

  /**
   * A redis client used for subscribing
   */
  private subscriber:RedisClient;

  /**
   * Subscriptions
   */
  private subscriptions:string[] = [];

  constructor(private config:RedisConfig) {
    super();
    this.connect();
  }

  connect() {
    var port = this.config.port ? this.config.port : 6379;
    var host = this.config.host ? this.config.host : 'localhost';
    var initialSubscribes:string[] = this.config.initialSubscribes ? this.config.initialSubscribes : [];

    this.publisher = createClient(port, host, this.config.connectionConfig);
    this.subscriber = createClient(port, host, this.config.connectionConfig);

    this.subscriber.on('error', this.onError.bind(this));
    this.subscriber.on('connect', this.onSubscribeConnected.bind(this));
    this.subscriber.on('message', this.onSubscribeMessage.bind(this));
    this.subscriber.on('subscribe', this.onSubscribedToChannel.bind(this));
    this.subscriber.on('unsubscribe', this.onUnsubscribedFromChannel.bind(this));

    initialSubscribes.forEach((c:string) => this.subscriber.subscribe(c));

    this.publisher.on('error', this.onError.bind(this));
    this.publisher.on('connect', this.onPublishedConnected.bind(this));
  }

  disconnect() {
    this.publisher.quit();
    this.subscriber.unsubscribe();
    this.subscriber.quit();
  }

  subscribe(channel:string) {
    if (this.subscriptions.indexOf(channel) < 0) {
      this.subscriber.subscribe(channel);
    }
  }

  unsubscribe(channel:string) {
    if (this.subscriptions.indexOf(channel) > -1) {
      this.subscriber.unsubscribe(channel);
    }
  }

  publish(channel:string, data:any) {
    this.publisher.publish(channel, JSON.stringify(data));
  }

  private onSubscribeConnected() {
    console.log('Subscriber connected');
    this.emit('redis:subscriber:connected');
  }

  private onSubscribedToChannel(channel:string) {
    this.subscriptions.push(channel);
    this.emit('redis:subscriber:subscribed', channel);
  }

  private onUnsubscribedFromChannel(channel:string) {
    this.subscriptions = _.reject(this.subscriptions, (c:string) => c === channel);
    this.emit('redis:subscriber:unsubscribed', channel);
  }

  private onSubscribeMessage(channel:string, message:string) {
    this.emit(channel, JSON.parse(message));
  }

  private onPublishedConnected() {
    console.log('Publisher connected');
    this.emit('redis:publisher:connected');
  }

  private onError(...args) {
    this.emit('redis:connection:error',...args);
  }
}
