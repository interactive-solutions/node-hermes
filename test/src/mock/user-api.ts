/**
 * @author Erik Norgren <erik.norgren@interactivesolutions.se>
 * @copyright Interactive Solutions
 */

import {UserEntity} from "../../../src/lib/user/user";

export class MockUserApi {
  authenticate(accessToken:string):Promise<UserEntity>  {
    var user = new UserEntity(1);
    var deferred = Promise.defer<UserEntity>();

    if (accessToken === 'valid-access-token') {
      deferred.resolve(user);

      return deferred.promise;
    }

    deferred.reject('Invalid access token');

    return deferred.promise;
  }
}
