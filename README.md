#####Developing
[Grunt](http://gruntjs.com/) is used to automate development tasks required to properly run the local deployment of the application.  
After most code changes, five ***post-code-change*** tasks should be run so that changes to the code base get surfaced during application runtime. These four tasks are:  
  
1) compile LESS files into CSS  
2) Adjust file path reference to LESS source-maps  
3) "Pre-compile" html partial pages/templates  
4) Browserify JavaScript codes into one file per HTML page, create source-maps, add cache-busting querystrings to source-map references  
5) Add cache-busting querystrings to the javascript and css tag-includes on HTML pages.  
  

The need for each of the above tasks is noted below. The easiest way to run all of these tasks after every codebase change is to set the custom Grunt "watch" configured in the `Gruntfile.js`.  At a terminal prompt, start it with:  
      
      > grunt watch:codeBase
    
With this watch running, the noted tasks will run after every file save. See `Gruntfile.js` for details.

######*Task 1: Compile LESS into CSS*  
LESS files are not CSS files themselves, although they are syntactically similar.  We use less here so that we may leverage it ability to utilize variables for CSS values such as colors, fonts, etc.  Assigning colors or fonts as a LESS variable is advantageous because the color and or font for the entire application can be changed in a single location (its LESS declaration), instead of in each specifiic CSS assignment.  
  
The LESS compilation task converts all LESS files for a given HTML page into a single CSS file that the browser can interpret.  The general approach is to create a LESS file with the same name as the HTML file it will serves (e.g., `index.less` will define CSS for `index.html`).  The contents of that file will likely include LESS `@import` to pull is LESS stored in other, perhaps shared files:  
  
    // Contents of index.less
    @import '../../../shared/less/fontcustom.less';  
    @import (less) '../../../shared/less/true-fonts.css';
    @import '../../../shared/less/header';

During the LESS compile, an `index.css` and `index.css.map` are created and saved to `app/deploy/assets/styles/`. `index.css.map` is the LESS source map; your browser leverages this so that when you use dev tools to inspect CSS, you can see the actual LESS code use to define the CSS (rather than the compiled CSS).  

######*Task 2: Adjust file path reference to LESS source-maps*
Not sure if it is a bug in the grunt-contrib-less compiler or my execution, but I have been unable to get the source-map URL of the LESS source-map file to be written correctly. Specifically, the URL of the source map is not set relative to the location of the CSS file is serves. Rather, it is set relative to the Gruntfile.js. As a workaround, I use grunt-replace to edit the source-map URL on the compiled CSS file(s).

######*Task 3: "Pre-compile" html partial pages/templates*  
Since the AngularJS Framework has no server-side component, the use of stand-alone HTML partials, templates, and snippets presents a problem.  While Angular does provide a simple way to "include" and stand-alone HTML snippets, the result may not be desirable. For example, let's say you are building a multi-page app and the header of each page is identical. You would probably want to store the markup of your header in `header.html` or some such file and use it as a partial on your index.html page, etc. You could use [`ng-include`](https://docs.angularjs.org/api/ng/directive/ngInclude), but then the content of `header.html` is only available after a separate GET request to the server. Obviously you want to minimize requests if possible; but this approach has an aesthetic consequence as well.  In this example, your page header will likely be rendered AFTER other portions of your page (because you have to wait for the GET response).  Maybe that's not enough to be concerned about, but in my opinion it feels a little unpolished.
  
There are a few workarounds for this issue. At this point in time, I leverage Angular's [$templateCache](https://docs.angularjs.org/api/ng/service/$templateCache) service, a custom directive, and a Grunt package called [grunt-html2js](https://www.npmjs.com/package/grunt-html2js). Using the `header.html` example, I will illustrate:  
  
1) The grunt-html2js task converts a HTML snippet (header.html) file to an Angular module  (`'templates-header'`) with the HTML stored in the modules $templateCache as a JavaScript string. It uses the file path of `header.html` as the #$templateCache key.

2) We create a `'App.Header'` module (header.module.js), and make it dependent on the above module `'templates-header'`". Then define a custom directive for our header, `'appHeader'`.  
  
	// Contents of header.module.js
	
	appHeader = angular.module('App.Header',  ['templates-header']);
	
	appHeader.directive('appHeader', function() {
	    return {
	        templateUrl: '../app/deploy/header.html'
	    };
	});

The directive will check the $templateCache for a key that is identical to the value set to the `templateUrl` property. Note that **grunt-htmljs** task set the $templateCache key for the header HTML as the file path of `header.html` (relative to `Gruntfile.js`); so if we set our directives `templateUrl` to the path of our `header.html` (still relative to `Gruntfile.js`), the directive will source its HTML from the $templateCache.

3) Create a dependency to `'App.Header'` in the module that serves as the ng-app of the HTML page on which you wish to use the `'appHeader'` directive.

4) Use appHeader where you want the HTML from `header.html` to appear:
      
      <div app-header></div>
     

######*Task 4: Browserify JavaScript codes into one file per HTML page...*  
We want to minimize the number of requests to the server; thus, have multiple `<script>` includes on our HTML page is not preferable.  We can avoid multiple `<script>` includes by leveraging **Browserify** as a script concatenator. Here is the approach we take:  

1) All script files are stored in `app/pages/` or `app/shared`, or some sub-directory therein. `app/pages/` has sub-directories for each separate HTML page of the application (e.g., `app/pages/index`, `app/pages/login`, etc). Each page directory contains a file used to concatenate all the script files needed to run the HTML page application.  For example, the contents of `app/pages/index/index.require.js`:

	require('../../shared/app-config.js');
	require('../../shared/modules/auth.module.js');
	require('../../shared/modules/settings.module.js');
	require('../../shared/templates.js');
	require('../../shared/modules/header.module.js');
	require('./index.module.js');

The Browserify task uses the above `require` keywords to concatenate the listed files into one giant file called `index.js` and saves that file to `app/deploy/assets/scripts/index.js`.  Then a single `<script>` include can be used to fetch all the javascript we need for the page:  

    <script src="assets/scripts/index.js"></script>

A few more things going on with this tasks.  Browserify creates source-maps so that you can browser-debug and add breakpoints to the individual JS files, rather than the concatenated `index.js`. In the noted example a `index.js.map` file is created and stored in `app/deploy/assets/scripts/`.

**Important**: I discovered as interesting wrinkle while leveraging source-maps of shared resources during the development of this multi-page application.  Some of the javascript files in the application are "shared resources" - they are leveraged on multiple pages (e.g., `index.html` and `login.html`) and therefore become part of the concatenated script file and source-map for each page. Here's the problem though:  the browser appears to cache it's interpretation of the source-map. Let me give an example:  
  
1) You visit the application login.html page with your browser.  Browser loads login.js and sees that it points to a source-map, login.js.map.  The browser then parses login.js.map and caches (I think) the individual files that compose login.js. For our example, let say that one of those files is called `settings.module.js`.  With browser Dev Tools and source-maps, you will be able to place a breakpoint in `settings.module.js` and inspect at runtime.

2) You login to the app successfully, and are redirected to `index.html`. Browser loads index.js and sees that it points to a source-map, index.js.map.  The browser then parses index.js.map and finds that this page also leverages `settings.module.js`. Here's where it gets weird.  I think the browser sees that it already has a map to `settings.module.js` (created during login.html load) and attempts to use it. Therein lies the problem: `settings.module.js` is improperly mapped to index.js - because the cached version is mapped to login.js.map, not index.js.map. I discovered this because the breakpoints I would try to set in `settings.module.js` while viewing index.html would not break on the correct line-numbers. That's because it was using line-numbers from login.js, not index.js (I think :)).

So, my work-around was to add cache-busting querystrings to the source-map filepath url that Browserify adds to the bottom of the concatenated file.  
  
     //# sourceMappingURL=login.js.map?login1422405944 

This appears to solve the problem. The querystring includes a timestamp to ensure the browser loads the latest version of the source-map.

***Note**: Concatenation and source-maps is not all Browserify has to offer.  With Browserify, you could write code like Node.js JS modules, leveraging the `require` keyword to manage dependency. Here we do not do that, because use of the `require` causes errors when paired with the Karma test runner - at least as of this writing.  This isn't a huge issue, because Angular does a good job of managing dependencies with the exception of maybe our config-settings file; more on that later. I've left Browserify in the mix as a script concatenator in the hope that `require` will eventually be supported by Karma.*

######*Task 5: Add cache-busting querystrings to the javascript and css tag-includes on HTML pages*  
Browsers tend to cache JavaScript and CSS resources. This is generally good, but when you make a code change, you want the browser to grab the updated resource from the server.  You can ensure this by adding a time-stamp querystring to the `src` attribute of these resource tags on the HTML page.  This task automates the addition of the time-stamp.
For example:  

     <script src="assets/scripts/index.js?1422406760058"></script>
is changed to:  

     <script src="assets/scripts/index.js?1422406760058"></script>  


#####Building and shipping the application
Before the app can be deployed to another environment (i.e., somewhere other than your localhost), off of your local machine, it needs to be configured properly.  For example, locally, you may want the app to hit the API at `http://localhost:3333`, but once deployed you will likely want it to hit `http://guard-duty-api.spatialdevmo.com`.  
Pre-deployment configuration changes should not be made on files use d for localhost development - otherwise you would have to roll back said configuration changes after the deployment so you could continue with normal development. To avoid such back and forth, a copy of the application code-set is copied to the `build` directory and then configuration changes can be made on those files. After the configuration changes, the [three post-code-change tasks](#postCodeChanges) need to be run again. We call this combined set of tasks the "build". To reiterate, "building" includes the follwoing steps:  

1) clear current files in `build/`
2) copy application files into `build/`
3) make configuration/settings changes for given deployment
4) compile LESS files into CSS
5) Browserify Javascript codes into one file per HTML page
6) add cache-busting querystrings to the javascript and css script tag includes on HTML pages
7) Splice in rollbar.com error logging code (optional)

After the build is complete, we can package the `build/` into a gzipped tar file (`ship/build.tar.gz`) and SCP to the deployment machine. We also SCP a copy of `/publish.sh` which can me be used to simplifiy unpacking and moving the files to the proper location on the deployment machine. Details necessar for SCP'ing a given deployment are stored in the `/config.json` file.

All of these building and shipping tasks are managed by Grunt. To build and ship a production instance of the application, go to a terminal prompt and run:  
    
    > grunt build-push --env production
      
Note the "--env" option; it indicates that the app will be configured for production and sent to the machine assigned to host the production instance.

#####Deployment machine steps
When the task is complete you can SSH onto the production server and `cd` to the location of `build.tar.gz` and `publish.sh`. If this is the first time that publish.sh has been SCP'd to the machine, you will need to:

    > sudo chmod +x publish.sh
    
Otherwise you can skip the chmod step and do:

    > sudo ./publish.sh
    
This script will clear any old files in the deployment machine's `build/` and un-tar the recently SCP'd `build.tar.gz`. It will then copy the contents of `build/deploy/` to the machine's `/static-deployments/guard-duty/` directory.  NGINX serves out the application from this location. See `/etc/nginx/sites-available/guard-duty.spatialdevmo.com` to make adjustments to the Nginx configuration if necessary.