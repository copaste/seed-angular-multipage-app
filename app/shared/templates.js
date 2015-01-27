angular.module('templates-header', ['../app/deploy/header.html']);

angular.module("../app/deploy/header.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("../app/deploy/header.html",
    "<div>\n" +
    "    <div class=\"navbar-header\">\n" +
    "        <p class=\"navbar-brand header-brand\">Application Header!!!</p>\n" +
    "    </div>\n" +
    "    <div id=\"navbar\" class=\"navbar-collapse collapse\">\n" +
    "        <ul class=\"nav navbar-nav\">\n" +
    "            <!--<li class=\"active\"><a href=\"home.html\">Home</a></li>-->\n" +
    "        </ul>\n" +
    "        <ul class=\"nav navbar-nav navbar-right\">\n" +
    "            <li><a ng-controller=\"LogoutController as logoutCtrl\" class=\"logout\" ng-click=\"logoutCtrl.logout()\">Logout</a></li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "</div>");
}]);
