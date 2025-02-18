import https from 'https'
import {IncomingMessage} from 'http';
import {getCert} from '@yandex-int/yandex-internal-cert';

const API = 'https://api.tms.yandex-team.ru/v1';
const {TMS_TOKEN} = process.env;

export const request = <T = unknown>(url: string, options: https.RequestOptions = {}): Promise<T> => {
  const path = API + `/${url.replace(/^\//, '')}`;
  const opts = {
    ca: getCert(),
    method: 'GET',
    ...options,
    headers: {
      Authorization: `OAuth ${TMS_TOKEN}`,
      ...(options.headers ?? {})
    }
  };

  return new Promise((resolve, reject) => {
    const cb = (res: IncomingMessage) => {
      const failed = res.statusCode && res.statusCode > 299 && res.statusCode < 200;

      if (failed) {
        reject(res.statusMessage);
      }

      res.setEncoding('utf8');

      res.on('data', (data) => {
        resolve(JSON.parse(data));
      });
    };

    const req = https.request(path, opts, cb);

    req.on('error', reject);
    req.end();
  });
};
