/**
 * @author Erik Norgren <erik.norgren@interactivesolutions.se>
 * @copyright Interactive Solutions
 */

import {EventEmitter} from "events";
import {RedisClient} from "redis";
import {createClient} from "redis";
import {ClientOpts} from "redis";

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

  constructor(private host:string, private port:number, private config:ClientOpts, private channels:string[] = []) {
    super();
    this.connect();
  }

  connect() {
    this.publisher = createClient(this.port, this.host, this.config);
    this.subscriber = createClient(this.port, this.host, this.config);

    this.subscriber.on('error', this.onError.bind(this));
    this.subscriber.on('connect', this.onSubscribeConnected.bind(this));
    this.subscriber.on('message', this.onSubscribeMessage.bind(this));
    this.subscriber.on('subscribe', this.onSubscribedToChannel.bind(this));
    this.subscriber.on('unsubscribe', this.onUnsubscribedFromChannel.bind(this));

    this.channels.forEach((c:string) => this.subscriber.subscribe(c));

    this.publisher.on('error', this.onError.bind(this));
    this.publisher.on('connect', this.onPublishedConnected.bind(this));
  }

  disconnect() {
    this.publisher.quit();
    this.subscriber.unsubscribe();
    this.subscriber.quit();
  }

  subscribe(channel:string) {
    this.subscriber.subscribe(channel);
  }

  unsubscribe(channel:string) {
    this.subscriber.unsubscribe(channel);
  }

  publish(channel:string, data:any) {
    this.publisher.publish(channel, JSON.stringify(data));
  }

  private onSubscribeConnected() {
    console.log('Subscriber connected');
    this.emit('redis:subscriber:connected');
  }

  private onSubscribedToChannel(channel:string) {
    this.emit('redis:subscriber:subscribed', channel);
  }

  private onUnsubscribedFromChannel(channel:string) {
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
