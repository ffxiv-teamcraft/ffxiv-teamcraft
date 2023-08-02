const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { merge } = require('webpack-merge');

module.exports = (config, options) => {
  return merge(config, {
    resolve: {
      fallback: {
        fs: false,
        child_process: false,
        bindings: false,
        path: false,
        https: false
      }
    },
    plugins: [
      new NodePolyfillPlugin()
    ],
    optimization: {
      minimizer: [
        new TerserPlugin({
          parallel: false,
          terserOptions: {
            compress: {
              reduce_vars: false
            }
          }
        })
      ]
    }
  });
};
