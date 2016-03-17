import * as request from 'request-promise';
import * as _ from 'lodash';

export default class AbstractApi {

  constructor(protected baseUri:string, protected apiToken:string) {}

  protected post(uri:string, body:any, headers:any = {}): Promise<any> {
    return request({
      method: 'POST',
      uri: this.baseUri + uri,
      json: true,
      body: body,
      headers: _.merge({
        authorization: `hermes ${this.apiToken}`,
      }, headers)
    }).catch(this.onHandleError.bind(this));
  }

  protected put(uri:string, body:any, headers:any = {}): Promise<any> {
    return request({
      method: 'PUT',
      uri: this.baseUri + uri,
      json: true,
      body: body,
      headers: _.merge({
        authorization: `hermes ${this.apiToken}`,
      }, headers)
    }).catch(this.onHandleError.bind(this));
  }

  protected get(uri:string, headers:any = {}, params?:any): Promise<any> {
    return request({
      method: 'GET',
      uri: this.baseUri + uri,
      json: true,
      qs: params,
      headers: _.merge({
        authorization: `hermes ${this.apiToken}`,
      }, headers)
    }).catch(this.onHandleError.bind(this));
  }

  private onHandleError(result: any) {
    if (result.statusCode === 422) {
      console.error('Validation errors');
      console.error(result.error.errors);
    } else {
      console.error(result);
    }

    return result;
  }
}
