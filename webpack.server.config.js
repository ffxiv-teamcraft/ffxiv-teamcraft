const path = require('path');
const webpack = require('webpack');

const APP_NAME = 'client';

module.exports = {
  entry: { server: './apps/client/server.ts' },
  resolve: { extensions: ['.js', '.ts'] },
  mode: 'development',
  target: 'node',
  externals: [
    /* Firebase has some troubles being webpacked when in
       in the Node environment, let's skip it.
       Note: you may need to exclude other dependencies depending
       on your project. */
    /^firebase/,
    "firebase",
    "@firebase/app",
    "@firebase/firestore",
    "@firebase/analytics",
    "@firebase/auth",
    "@firebase/functions",
    "@firebase/installations",
    "@firebase/messaging",
    "@firebase/messaging/sw",
    "@firebase/storage",
    "@firebase/performance",
    "@firebase/remote-config",
    "@firebase/util",
    "bufferutil",
    "utf-8-validate"
  ],
  output: {
    // Export a UMD of the webpacked server.ts & deps, for
    // rendering in Cloud Functions
    path: path.join(__dirname, `dist/${APP_NAME}-webpack`),
    library: 'app',
    libraryTarget: 'umd',
    filename: '[name].js'
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: 'ts-loader' }
    ]
  },
  plugins: [
    new webpack.ContextReplacementPlugin(
      /(.+)?angular(\\|\/)core(.+)?/,
      path.join(__dirname, 'src'), // location of your src
      {} // a map of your routes
    ),
    new webpack.ContextReplacementPlugin(
      /(.+)?express(\\|\/)(.+)?/,
      path.join(__dirname, 'src'),
      {}
    )
  ]
};
