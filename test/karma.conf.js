// Karma configuration
// Generated on Tue Nov 18 2014 12:22:40 GMT-0800 (PST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        'app/shared/app-config.js',
      'app/deploy/assets/scripts/angular/angular.js',
      'app/deploy/assets/scripts/angular-ui-router/release/angular-ui-router.js',
      'app/deploy/assets/scripts/angular-mocks/angular-mocks.js',
      'app/deploy/assets/scripts/angular-bootstrap/*.js',
      'app/shared/modules/*.js',
      'app/pages/**/*.js',
      'test/unit/pages/login/loginFormControllerSpec.js',
      'test/unit/shared/auth/authUtilsServiceSpec.js'
    ],


    // list of files to exclude
    exclude: [
      'app/pages/**/*.require.js',
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 8080,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
