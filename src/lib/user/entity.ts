/**
 * @author Erik Norgren <erik.norgren@interactivesolutions.se>
 * @copyright Interactive Solutions
 */

export class UserEntity {
  constructor(private _id:any) {}

  get id():any {
    return this._id;
  }
}
