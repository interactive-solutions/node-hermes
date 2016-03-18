/**
 * @author Erik Norgren <erik.norgren@interactivesolutions.se>
 * @copyright Interactive Solutions
 */

import {Hermes} from "./hermes";

var hermesConfig = {
  listenOnPort: 5000
};

var apiConfig = {
  baseUri: 'api.epulze.dev',
  apiToken: 'helloWorld'
};

var socketServerConfig = {
  events: []
};

var redisConfig = {
  initialSubscribes: ['test1', 'test2']
};

var hermes = new Hermes(hermesConfig, apiConfig, socketServerConfig, redisConfig);

hermes.run();
