module.exports = (config, options) => {
  config.optimization.minimizer = config.optimization.minimizer.map(minimizer => {
    if (minimizer.options && minimizer.options.parallel) {
      minimizer.options.parallel = false;
    }
    return minimizer;
  });
  return config;
};
