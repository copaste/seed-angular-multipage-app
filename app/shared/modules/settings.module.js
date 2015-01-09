/**
 * Created by rgwozdz on 12/8/14.
 */

var isUnitTesting = !!document.URL.match(/debug\.html/);

if(isUnitTesting === true) {

    var settings = karmaSettings;
} else {
    var settings = require('../../../app-config.json');
}

/*
var settings = {

    "apiHost": "http://localhost:3333/",


    "apiRoutes": {
        "authenticate": "authenticate",
        "authenticateToken": "api/authenticate-token",
        "goNoGo" :"api/test-suites-overview"
    }

};
*/

// Build complete API routes (host + route);
for (var key in settings.apiRoutes) {

    settings.apiRoutes[key] = settings.apiHost + settings.apiRoutes[key];
}

var applicationSettings = angular.module('App.Settings',  []);

applicationSettings.constant('settings', settings);

