// https://github.com/vbenjs/vite-plugin-mock/blob/main/README.zh_CN.md
import type { MockMethod /*, MockConfig */ } from 'vite-plugin-mock'
import MapData from './data/map.json'
import ScenecodeMapData from './data/scenecode.json'

export default [
  {
    url: '/map/page',
    method: 'get',
    timeout: 2000,
    response: (conf) => {
      console.log('🚀 ~ page:', conf.query)
      return {
        code: 0,
        data: MapData,
        msg: 'success'
      }
    }
  },
  {
    url: '/system/scene-code/page',
    method: 'get',
    timeout: 2000,
    response: (conf) => {
      console.log('🚀 ~ page:', conf.query)
      return {
        code: 0,
        data: ScenecodeMapData,
        msg: 'success'
      }
    }
  }
  // {
  //   url: '/admin-api/map/page',
  //   method: 'post',
  //   timeout: 1000,
  //   response: {
  //     code: 0,
  //     data: MapData,
  //     msg: 'success'
  //   }
  // }
  // {
  //     url: '/api/text',
  //     method: 'post',
  //     rawResponse: async (req, res) => {
  //         let reqbody = '';
  //         await new Promise(resolve => {
  //             req.on('data', chunk => {
  //                 reqbody += chunk;
  //             });
  //             req.on('end', () => resolve(undefined));
  //         });
  //         res.setHeader('Content-Type', 'text/plain');
  //         res.statusCode = 200;
  //         res.end(`hello, ${reqbody}`);
  //     },
  // },
] as MockMethod[]
