describe('LoginFormController ->', function() {

    var ctrl, ctrlScope, mockBackend;

     //Mock the window.location.href object
    var $window = {
            // now, $window.location.path will update that empty object
            location: {},
            // we keep the reference to window.document
            document: window.document,

            localStorage: {}
        };;

    beforeEach(module("loginPage"));

    beforeEach(module(function ($provide) {

        // We register our new $window instead of the old
        $provide.constant('$window', $window);
    }));

    beforeEach(inject(function($controller, $rootScope, $window, settings) {

        ctrlScope = $rootScope.$new();

        ctrl = $controller('LoginFormController', {
            $scope: ctrlScope
        });

    }));

    describe('Check constructor function ->', function(){

        it('should have password and username properties', function() {

            expect(ctrl.user.username).toBeNull();
            expect(ctrl.user.password).toBeNull();
        });
    });

    describe('User login ->', function() {


        beforeEach(inject(function($controller, $rootScope, $httpBackend, $window, settings) {

            // Mock the authenticate route, and failed credentials
            mockBackend = $httpBackend;
            mockBackend.expectPOST(settings.apiRoutes.authenticate)
                .respond(401, 'Invalid Creds');


        }));


        it('should fail authentication and indicate bad credentials', function() {

            $window.location.href = 'login.html';

            ctrl.submitCreds();

            mockBackend.flush();

            expect(ctrl.badCredentials).toEqual(true);
        });

        afterEach(function(){

            //Ensure that all expects set on the $httpBackend were actually called
            mockBackend.verifyNoOutstandingExpectation();

            // Ensure that all requests to the server have actually responded (using flush());
            mockBackend.verifyNoOutstandingRequest();
        });
    });
});

/*

*/