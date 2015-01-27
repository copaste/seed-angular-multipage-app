appHeader = angular.module('App.Header',  ['templates-header']);

appHeader.directive('appHeader', function() {
    return {
        templateUrl: '../app/deploy/header.html'
    };
});


