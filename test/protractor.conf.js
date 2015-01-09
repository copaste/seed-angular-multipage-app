exports.config = {


    //the selenium web server
    seleniumAddress:'http://127.0.0.1:4444/wd/hub',


    //location of all integration test files
    specs:[
        './e2e/**/*.js'
    ],


    //web app url - DEVELOPMENT
    baseUrl:'', //<---CHANGE ME HERE
    //web app url - TEST
    //baseUrl:'',
    //web app url - PRODUCTION
    //baseUrl:'',


    //target browsers to open and test on
    multiCapabilities: [{
        browserName: 'firefox'
    }, {
        browserName: 'chrome'
    }],


    //options to be passed to Jasmine-node.
    jasmineNodeOpts: {
        showColors: true // Use colors in the command line report.
    }
};
