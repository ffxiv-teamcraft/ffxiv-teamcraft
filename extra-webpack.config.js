const TerserPlugin = require('terser-webpack-plugin');

module.exports = (config, options) => {
  config.optimization.minimizer = config.optimization.minimizer.map(minimizer => {
    if (minimizer instanceof TerserPlugin) {
      minimizer.options.parallel = false;
    }
    return minimizer;
  });
  return config;
};
