const path = require('path');
export default {
  targets: {
    ie: 9
  },
  plugins: [
    ['umi-plugin-react', {
      dva: true,
      antd: true,
      routes: {
        exclude: [
          /data\//,
          /models\//,
          /services\//,
          /components\//,
        ],
      },
      dynamicImport: true,
    }],
  ],
  externals:  {
    jquery: 'jQuery',
  },
  extraBabelPlugins: [
    ['import', {libraryName: 'antd', libraryDirectory: 'es', style: true}],
  ],
  theme: './src/theme.js',
  env: {
    development: {
      extraBabelPlugins: ['dva-hmr'],
    },
  },
  alias: {
    'lib': path.resolve(__dirname, 'src/lib/'),
    'components': path.resolve(__dirname, 'src/components/'),
    'layouts': path.resolve(__dirname, 'src/layouts/'),
    'utils': path.resolve(__dirname, 'src/utils/'),
    'constant': path.resolve(__dirname, 'src/constant/'),
    'data': path.resolve(__dirname, 'src/data/'),
  },
  ignoreMomentLocale: true,
  proxy: {
    '/gateway': {
      'target': 'http://gateway',
      'changeOrigin': true,
    },
    '/dzws': {
      'target': 'http://gateway',
      'changeOrigin': true,
    },
    '/dzjz': {
      'target': 'http://gateway',
      'changeOrigin': true,
    },
    '/lxfz': {
      'target': 'http://gateway',
      'changeOrigin': true,
    },
    '/latj': {
      'target': 'http://gateway',
      'changeOrigin': true,
    },
    '/jcfx': {
      'target': 'http://gateway',
      'changeOrigin': true,
    },
    '/ocrservice': {
      'target': 'http://gateway',
      'changeOrigin': true,
    },
    '/nlpservice': {
      'target': 'http://gateway',
      'changeOrigin': true,
    },

  },
}
