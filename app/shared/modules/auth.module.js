/**
 * Created by rgwozdz on 12/3/14.
 */

// Create the authentication module
var auth = angular.module('App.Auth', ['App.Settings']);

auth.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push(function($q, $location, $window) {
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
                        if (loc.indexOf('login.html') === -1) {

                            // redirect to login
                            $window.location = 'login.html';
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

        } else if (userToken === null && loc.indexOf('login.html') === -1) {

            $window.location.href = 'login.html';
            return;

        } else if (userToken === null && loc.indexOf('login.html') > -1) {

            return;

        } else if (userToken === null) {

            // Redirect to login page unless they are already on it; this prob not necessary, but just in case for now
            if (loc.indexOf('login.html') === -1) {
                $window.location.href = 'login.html';
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
        if (loc.indexOf('login.html') === -1) {

            // redirect to login
            $window.location.href = 'login.html';
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
