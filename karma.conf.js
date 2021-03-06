// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function (config) {
  config.set({
    autoWatch: true,
    basePath: '',
    browsers: ['Chrome'],
    client: {
      jasmine: {
        failSpecWithNoExpectations: true,
        random: true,
        verboseDeprecations: true,
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    colors: true,
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
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    logLevel: config.LOG_ERROR,
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
      require('karma-firefox-launcher'),
    ],
    port: 9876,
    reporters: ['progress', 'kjhtml'],
    restartOnFileChange: true,
    singleRun: false,
  });
};
