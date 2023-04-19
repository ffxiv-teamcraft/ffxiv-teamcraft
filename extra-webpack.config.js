const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (config, options) => {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    child_process: false,
    bindings: false,
    path: false,
    https: false
  };
  config.plugins.push(new NodePolyfillPlugin());
  config.optimization.minimizer.push(new TerserPlugin({
    parallel: false,
    terserOptions: {
      compress: {
        reduce_vars: false
      }
    }
  }));
  return config;
};
