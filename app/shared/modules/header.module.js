appHeader = angular.module('App.Header',  ['templates-main']);

appHeader.directive('appHeader', function() {
    return {
        templateUrl: '../app/deploy/header.html'
    };
});


