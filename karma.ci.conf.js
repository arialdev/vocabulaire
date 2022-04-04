// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function (config) {
  config.set({
    autoWatch: false,
    basePath: '',
    browserNoActivityTimeout: 5000,
    browserSocketTimeout: 5000,
    browsers: ['ChromeHeadless'],
    captureTimeout: 10000,
    client: {
      jasmine: {
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        failSpecWithNoExpectations: true,
        random: true,
        verboseDeprecations: false,
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    colors: true,
    concurrency: Infinity,
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/ngv'),
      subdir: '.',
      reporters: [
        {type: 'lcov', subdir: 'report-lcov'},
        {type: 'html'},
        {type: 'text-summary'}
      ]
    },
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    logLevel: config.LOG_INFO,
    plugins: [
      require('karma-jasmine'), //?
      require('karma-chrome-launcher'), //mmm
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    port: 9876,
    // preprocessors: {
    //   'src/app/**/*.ts': ['coverage']
    // },
    singleRun: true,
    reporters: ['progress', 'coverage'],
    retryLimit: 0,
  });
};
