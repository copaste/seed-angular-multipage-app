

var app = angular.module('indexPage',  ['App.Auth', 'App.Settings', 'App.Header']);

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



