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
