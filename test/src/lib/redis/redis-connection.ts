/**
 * @author Erik Norgren <erik.norgren@interactivesolutions.se>
 * @copyright Interactive Solutions
 */

import * as chai from 'chai';
import {RedisConnection} from "../../../../src/lib/redis/redis-connection";

describe('Redis connection', () => {
  var connection:RedisConnection;

  beforeEach(() => {
    connection = new RedisConnection({});
  });

  afterEach(() => {
    connection.disconnect();
  });

  it('Should trigger event on connected', (done) => {
    var eventCount = 0;

    connection.on('redis:subscriber:connected', () => {
      if (++eventCount === 2) {
        chai.assert.equal(connection.subscriptions.length, 0);

        done();
      }
    });

    connection.on('redis:publisher:connected', () => {
      if (++eventCount === 2) {
        chai.assert.equal(connection.subscriptions.length, 0);

        done();
      }
    });

    connection.connect();
  });

  it('Should trigger event on subscribed to channel', (done) => {
    connection.on('redis:subscriber:subscribed', (channel) => {
      chai.assert.equal(channel, 'channel');
      chai.assert.equal(connection.subscriptions.length, 1);

      done();
    });

    connection.connect();
    connection.subscribe('channel');
  });

  it('Should trigger event on unsubscribed from channel', (done) => {
    connection.subscribe('channel');

    connection.on('redis:subscriber:subscribed', (channel:string) => {
      chai.assert.equal(channel, 'channel');
      chai.assert.equal(connection.subscriptions.length, 1);
      connection.unsubscribe('channel');
    });

    connection.on('redis:subscriber:unsubscribed', (channel:string) => {
      chai.assert.equal(connection.subscriptions.length, 0);
      chai.assert.equal(channel, 'channel');

      done();
    });

    connection.connect();
  });

  it('Should trigger event on subscribed event', (done) => {
    connection.subscribe('channel');

    connection.on('channel', (data:any) => {
      chai.assert.equal({data: 'data'}, data);

      done();
    });

    connection.publish('channel', {data: 'data'});
  });
});
