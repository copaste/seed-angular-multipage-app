

var app = angular.module('indexPage',  ['App.Auth', 'App.Settings']);

app.controller('IndexPageController', ['$scope', '$http', '$q','AuthUtils', 'settings', function($scope, $http, $q,
                                                                                        AuthUtils, settings){

    AuthUtils.checkForToken();
    AuthUtils.checkTokenValidity()
        .then(function (response) {

            // Token is valid; they can stay on this page;
            return;
        })
        .catch(function (err) {

            AuthUtils.logout();
        });

    console.log('Index Fired');

}]);


app.controller('SuitesDashboardController', ['$scope', '$http', '$q', 'settings', function($scope, $http, $q, settings){

    var self = this;

    self.suites = [];

    getGoNoGoResults($q, $http, settings)
        .then(function(response){

            self.suites = response;
        })
        .catch(function(err){
            console.log(err);
        });

    self.getStatusClass = function(status){
        return {
            passed : status,
            failed: !status
        };
    };
}]);


var getGoNoGoResults  = function($q, $http, settings){


    var deferred = $q.defer();

    var responsePromise = $http.get(settings.apiRoutes.goNoGo);

    responsePromise.success(function(res, status, headers, config) {

        // if the token is valid, response will contain {authenticated: true}
        if(res.hasOwnProperty('suites')){

            deferred.resolve(res.suites);

        } else {

            deferred.reject(false);
        }

    });

    responsePromise.error(function(res, status, headers, config) {
        deferred.reject(false);
    });

    return deferred.promise;

};
