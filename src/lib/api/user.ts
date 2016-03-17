import AbstractApi from './index';
import * as request from 'request-promise';
import * as _ from 'lodash';
import {UserEntity} from "../user/entity";

export class UserApi extends AbstractApi {
  authenticate(accessToken:String):Promise<UserEntity> {
    return this.getUser('/users/me', `Bearer ${accessToken}`);
  }

  private getUser(route:string, authHeader:string):Promise<UserEntity> {
    return request({
      method: 'GET',
      uri: this.baseUri + route,
      json: true,
      headers: {
        Authorization: authHeader
      }
    }).then((data:any) => {
      return new UserEntity(data.id);
    });
  }
}
