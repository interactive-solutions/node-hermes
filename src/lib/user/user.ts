/**
 * @author Erik Norgren <erik.norgren@interactivesolutions.se>
 * @copyright Interactive Solutions
 */

import * as _ from 'lodash';

export class UserEntity {
  constructor(private _id:any) {}

  get id():any {
    return this._id;
  }
}

/**
 * Multi purpose collection of users
 */
export class UserCollection {

  private users:{[key:number]:UserEntity} = {};

  // Used internally to track the order of elements being added to the collection
  private order:number[] = [];

  constructor(users:UserEntity[] = []) {
    users.forEach((u:UserEntity) => {
      if (u) {
        this.add(u);
      }
    });
  }

  has(id:number):boolean {
    return this.users[id] ? true : false;
  }

  get(id:number):UserEntity {
    if (this.has(id)) {
      return this.users[id];
    }

    return null;
  }

  getFromArray(ids:number[]):UserEntity[] {
    return ids
      .map((id:number) => this.get(id))
      .filter((u:UserEntity) => {
        return u !== null;
      });
  }

  remove(user:UserEntity):void {
    if (this.has(user.id)) {
      delete this.users[user.id];

      this.order = _.reject(this.order, (id:number) => {
        return id === user.id;
      });
    }
  }

  add(user:UserEntity):void {
    if (!this.has(user.id)) {
      this.users[user.id] = user;
      this.order.push(user.id);
    }
  }

  count():number {
    return _.size<UserEntity>(_.values<UserEntity>(this.users));
  }

  each(func:(user:UserEntity) => void) {
    _.each(this.users, func);
  }

  /**
   * Return the first user where the callback returns true
   *
   * @param func
   *
   * @returns {any}
   */
  find(func:(user:UserEntity) => boolean):UserEntity {
    return _.find<UserEntity>(<UserEntity[]> this.users, func);
  }

  /**
   * Extract the given field from each user
   *
   * @param field
   *
   * @returns {any[]}
   */
  pluck(field:string):any[] {
    return _.map(<UserEntity[]> this.users, _.property(field));
  }

  toArray():UserEntity[] {
    return _.map(this.order, (id:number) => {
      return this.has(id) ? this.get(id) : null;
    });
  }

  shuffle():UserEntity[] {
    return _.shuffle(this.toArray());
  }
}
