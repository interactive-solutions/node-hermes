import AbstractApi from './index';
import * as request from 'request-promise';
import * as _ from 'lodash';
import {UserEntity} from "../user/user";

export class UserApi extends AbstractApi {
  authenticate(accessToken:string):Promise<UserEntity> {
    return request({
      method: 'GET',
      uri: this.config.baseUri + this.config.authenticationUri ? this.config.authenticationUri : '/users/me',
      json: true,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then((data:any) => {
      return new UserEntity(data.id);
    });
  }
}
