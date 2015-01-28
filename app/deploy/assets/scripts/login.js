(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var app = angular.module('loginPage',  ['App.Auth', 'App.Settings']);

app.controller('LoginPageController', ['$scope', '$http', '$q','AuthUtils', function($scope, $http, $q,
                                                                                        AuthUtils){
    AuthUtils.checkForToken();

    AuthUtils.checkTokenValidity()
    .then(function (response) {
        // Token is valid; they can stay on this page.
        return;
    }, function (err) {

           AuthUtils.logout();
    });

}]);

// Handle login event
app.controller('LoginFormController', ['$scope', '$http', '$window', 'settings', function($scope, $http, $window, settings) {

    var controllerContext = this;

    controllerContext.user = {username: null, password: null};

    controllerContext.submitCreds = function(){

        controllerContext.badCredentials = false;

            // Authenticate creds
            var responsePromise = $http.post(settings.apiRoutes.authenticate, controllerContext.user);

            responsePromise.success(function(res, status, headers, config) {

                var message = res.message || null;

                if(message === 'authenticated'){

                    $window.location.href = settings.homePage;

                } else {
                    controllerContext.badCredentials = true;
                }
            });

            responsePromise.error(function(res, status, headers, config) {
                controllerContext.badCredentials = true;
            });

    };

    var self = this;
    self.submit = function () {
        console.log('User clicked submit with ', self.user);
    };
}]);

},{}],2:[function(require,module,exports){
require('./../../shared/app-config.js');
require('./../../shared/modules/auth.module.js');
require('./../../shared/modules/settings.module.js');
require('./login.module.js');

},{"./../../shared/app-config.js":3,"./../../shared/modules/auth.module.js":4,"./../../shared/modules/settings.module.js":5,"./login.module.js":1}],3:[function(require,module,exports){
 _APP_CONFIG = {

    "apiHost": "http://localhost:3333/",

    "apiRoutes": {
      "authenticate": "authenticate",
      "authenticateToken": "api/authenticate-token"
    },

     "loginPage": "login.html",
     "homePage": "index.html"

};

},{}],4:[function(require,module,exports){
/**
 * Created by rgwozdz on 12/3/14.
 */


// Create the authentication module
var auth = angular.module('App.Auth', ['App.Settings']);

auth.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push(function($q, $location, $window, settings) {
        return {

            request: function(config) {

                // Attach the authorization header for the API
                config.headers.Authorization = 'Bearer ' + $window.localStorage.userToken;

                return config;
            },

            requestError: function(rejection) {

                // error code here

                return $q.reject(rejection);

            },
            response: function(result) {

                // We refresh our auth token on every API response so that the expiration window slides forward.
                // So, if the response is delivered with a new authorization header attached, update the local storage value
                var authHeaderToken = result.headers('authorization') || null;

                if(authHeaderToken !== null) {
                    // Store token in local storage
                    $window.localStorage.userToken = authHeaderToken;

                }

                return result;
            },

            responseError: function(rejection) {

                switch (rejection.status) {
                    case 0:
                        // Send to error page if no api response
                        $window.location = "503.html";
                        return;

                        break;

                    case 401:

                        // Delete userToken from localStorage
                        delete $window.localStorage.userToken;

                        var loc =  $window.location.href;

                        // redirect to login page if not already there
                        if (loc.indexOf(settings.loginPage) === -1) {

                            // redirect to login
                            $window.location = settings.loginPage;
                        }

                        break;

                }

                return $q.reject(rejection);
            }
        };
    });
}]);

auth.factory('AuthUtils', ['$q', '$http', '$window', '$location','settings', function($q, $http, $window, $location, settings) {

    var checkForToken = function() {

        var userToken = $window.localStorage.userToken || null;

        var loc = $window.location.href;

        if (userToken !== null) {

            return;

        } else if (userToken === null && loc.indexOf(settings.loginPage) === -1) {

            $window.location.href = settings.loginPage;
            return;

        } else if (userToken === null && loc.indexOf(settings.loginPage) > -1) {

            return;

        } else if (userToken === null) {

            // Redirect to login page unless they are already on it; this prob not necessary, but just in case for now
            if (loc.indexOf(settings.loginPage) === -1) {
                $window.location.href = settings.loginPage;
            }

            // No token and already on the login page
            return;
        }
    };

    var checkTokenValidity  = function(){

        var deferred = $q.defer();

        // AJAX request to token checking route; the token is stored as Authorization header value in the
        // http request
        var responsePromise = $http.get(settings.apiRoutes.authenticateToken);

        responsePromise.success(function(res, status, headers, config) {

            // if the token is valid, response will contain {authenticated: true}
            if(res.hasOwnProperty('authenticated')){

                if(res.authenticated === true) {
                    // Valid token
                    deferred.resolve(true);
                } else {
                    // token is invalid;
                    deferred.reject(false)
                }

            } else {

                deferred.reject(false);
            }

        });

        responsePromise.error(function(res, status, headers, config) {
            deferred.reject(false);
        });

        return deferred.promise;

    };

    var logout = function(){

        // Delete userToken from localStorage
        delete $window.localStorage.userToken;

        var loc = $window.location.href;

        // redirect to login page if not already there
        if (loc.indexOf(settings.loginPage) === -1) {

            // redirect to login
            $window.location.href = settings.loginPage;
        }

        return;

    };

    return {
        checkForToken: function() { return checkForToken(); },
        checkTokenValidity : function(){ return checkTokenValidity();},
        logout: function(){ return logout();}

    };

}]);

// Controller for logout DOM event
auth.controller('LogoutController', ['$scope', 'AuthUtils',function($scope, AuthUtils) {

    this.logout = function() {

        AuthUtils.logout();
    };

}]);

},{}],5:[function(require,module,exports){
/**
 * Created by rgwozdz on 12/8/14.
 */

var settings = _APP_CONFIG;

// Build complete API routes (host + route);
for (var key in settings.apiRoutes) {

    settings.apiRoutes[key] = settings.apiHost + settings.apiRoutes[key];
}

var applicationSettings = angular.module('App.Settings',  []);

applicationSettings.constant('settings', settings);

},{}]},{},[2])


//# sourceMappingURL=login.js.map?login1422429724
