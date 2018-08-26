module.exports = function() {
  return {
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly', 'text-summary'],
      dir: './coverage',
      skipFilesWithNoCoverage: true,
      'report-config': {
        html: {
          subdir: 'html'
        }
      }
    },
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    port: 9876,
    browserNoActivityTimeout: 30000,
    colors: true,
    autoWatch: true,
    browsers: process.env.TRAVIS ? ['ChromeHeadlessNoSandbox'] : ['Chrome'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
    singleRun: false
  };
};
