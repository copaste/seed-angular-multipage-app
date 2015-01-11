
describe('AuthUtils Service ->', function() {

   var $window = {
        // now, $window.location.path will update that empty object
        location: {},
        // we keep the reference to window.document
        document: window.document,

        localStorage: {}
    };

    describe('checkForToken() ->', function() {

        beforeEach(module("App.Auth"));

        beforeEach(module(function ($provide) {

            // We register our new $window instead of the old
            $provide.constant('$window', $window);
        }));


        it('should set location to ' + _APP_CONFIG.loginPage, inject(function (AuthUtils) {

            //Mock the window object with necessary properties
            $window.localStorage.userToken;
            $window.location.href = _APP_CONFIG.homePage;

            AuthUtils.checkForToken();

            expect($window.location.href).toContain(_APP_CONFIG.loginPage);

        }));


        it('should allow location to remain as ' + _APP_CONFIG.homePage, inject(function(AuthUtils) {

            //Mock the window object with necessary properties
            $window.localStorage.userToken = 'ABCDEFG';

            $window.location.href = _APP_CONFIG.homePage;

            AuthUtils.checkForToken();

            expect($window.location.href).toContain(_APP_CONFIG.homePage);

        }));

    });

    describe('checkTokenValidity ->', function() {

        var mockBackend;

        beforeEach(module("App.Auth"));

        beforeEach(module(function ($provide) {

            // We register our new $window instead of the old
            $provide.constant('$window', $window);
        }));

        beforeEach(inject(function( $httpBackend, settings) {

            // Mock the authenticate route, and failed credentials
            mockBackend = $httpBackend;
            mockBackend.expectGET(settings.apiRoutes.authenticateToken)
                .respond(200, {authenticated : true});

        }));

        it('should validate token', inject(function(AuthUtils) {

            $window.location.href = _APP_CONFIG.homePage;

            AuthUtils.checkTokenValidity()
                .then(function(response){

                    expect(response).toEqual(true);

                })
                .catch(function(err){
                    var stop;
                });

            mockBackend.flush();
            //Ensure that all expects set on the $httpBackend were actually called
            mockBackend.verifyNoOutstandingExpectation();

            // Ensure that all requests to the server have actually responded (using flush());
            mockBackend.verifyNoOutstandingRequest();
        }));


    });

    describe('logout() ->', function(){

        beforeEach(module("App.Auth"));

        beforeEach(module(function ($provide) {

            // We register our new $window instead of the old
            $provide.constant('$window', $window);
        }));


        it('should set location to ' + _APP_CONFIG.loginPage+ ' and set localStorage.userToken to undefined', inject(function(AuthUtils) {

            //Mock the window object with necessary properties
            $window.localStorage.userToken = 'ABCDEFG';
            $window.location.href = _APP_CONFIG.homePage;

            AuthUtils.logout();

            expect($window.location.href).toContain(_APP_CONFIG.loginPage);
            expect($window.localStorage.userToken).toBeUndefined();

        }));

    });

});

