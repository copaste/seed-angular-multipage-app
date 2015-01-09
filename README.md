#####Developing
[Grunt](http://gruntjs.com/) is used to automate development tasks required to properly run the local deployment of the application. Three ***post-code-change*** tasks should be run so that changes during development get surfaced during runtime of the application: <a name="postCodeChanges">1) compile LESS files into CSS; 2) Browserify Javascript codes into one file per HTML page; 3) add cache-busting querystrings to the javascript and css script tag includes on HTML pages. </a>The easiest way to run these tasks after every codebase change is to set the custom Grunt "watch" configured in the Gruntfile.js.  At a terminal prompt, start it with:  
      
      > grunt watch:codeBase
    
With this watch running, the three noted tasks will run after every file save. See Gruntfile.js for details.

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