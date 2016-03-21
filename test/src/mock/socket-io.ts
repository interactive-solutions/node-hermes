/**
 * @author Erik Norgren <erik.norgren@interactivesolutions.se>
 * @copyright Interactive Solutions
 */

import {EventEmitter} from "events";

export class MockSocketIO extends EventEmitter {
  constructor() {
    super();
  }
}
