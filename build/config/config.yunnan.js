
export const config = {
  $meta: 'This file configures the plot device.',
  projectName: 'cm-robot',
  port: {
    web: 8000,
  },
  backend: {
    domain: "http://gateway/frontendservice",
    url: "/api/backend"
  },
  gateway: {
    domain: 'http://gateway',
  },
  storage: {
    mongodb: {
      url: "mongodb://localhost:27017/storage"
    },
    redis: {
        host: "localhost",
        opts: {
          parser: "javascript"
        },
        password: "myPass1@#"
    }
  },
  app: {
    integrate: false,
    scaleImage: false,
    version: 'JS_V2_B1',
    portal: '/',
    context: '',
    staticContext: '/cm/static',
    jwtSecret: "fcff344ad870205f9e2f5c9a30928ee5112c0c78",
    //  wopiHost: '192.168.7.108',//测试
    // wopiHost: '192.168.124.29',//内网
    // wopiHost: '143.80.1.93',//正式
    wopiHost: '192.168.124.56',//内网
    wopiContext: '/cm',
    tools: {
      lx: "/lxfz/dplx",
      la: "/latj/dpla",
      jc: "/jcfx",
    },
    config: {
      appCode: 'ZNFZ',
      appName: "云南省检察机关毒品案件办理智能辅助系统",
      icpNo: "滇ICP备15052717-1号",
      copyright: '2018 北京赛迪时代信息技术股份有限公司',
      views: {
        cache: false
      }
    },
    env:  "production",
    domain: "www.ccidit.com",
    meta: {
      "qc:admins": "2544126266641672526375",
      "wb:webmaster": "0ce41f66da7269f0"
    },
    entry: {
      key: "d4624c36b6795d1d99dcf0547af5443d"
    },
    provence: {
      shortCode: "53",
      code: "530",
      name: "云南省",
    },
    task: {
      condition : [
        {
          "ysay": "走私、贩卖、运输、制造毒品罪",
          "ajmc": [
            "运输毒品",
            "走私毒品",
            "贩卖毒品"
          ]
        },
      ]
    },
    process: {
      simple: ['交通肇事罪'],
      multiple:['盗窃罪'],
    }
  },
  oauth2: {
    callback: "http://www.ccidit.com/passport",
    weixin: {
      clientID: "wxf1c90a358975b48c",
      clientSecret: "d4624c36b6795d1d99dcf0547af5443d"
    },
    weibo: {
      clientID: "2600977444",
      clientSecret: "ab30bab7d3721304537ae8b24616c542"
    },
    qq: {
      clientID: "101296564",
      clientSecret: "3dd4b5508e8dc153ac2790e89653b8f6"
    }
  }
};
