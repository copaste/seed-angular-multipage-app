/**
 * Created by rgwozdz on 12/8/14.
 */


var settings = {

    "apiHost": "http://guard-duty-api.spatialdevmo.com/",


    "apiRoutes": {
        "authenticate": "authenticate",
        "authenticateToken": "api/authenticate-token",
        "goNoGo" :"api/test-suites-overview"
    }

};

// Build complete API routes (host + route);
for (var key in settings.apiRoutes) {

    settings.apiRoutes[key] = settings.apiHost + settings.apiRoutes[key];
}

var applicationSettings = angular.module('App.Settings',  []);

applicationSettings.constant('settings', settings);

