var config = require('./deploy-config.json');
var rollbar = require('./rollbar');

function dateStamp(){
    return new Date().getTime();
}

module.exports = function(grunt) {

    var env = grunt.option('env') || 'development';

    if(env === 'production' || env === 'staging') {
        var hostIp = config.environment[env].hostIp;
        var hostPath = config.environment[env].hostPath;
        var hostUser = config.environment[env].hostUsername;
        var pem = config.environment[env].pemFilePath;

        console.log('scp -i ' + pem + ' ship/build.tar.gz '+ hostUser + '@' + hostIp + ':'+ hostPath);
    }

    console.log(config);

    // 1. All configuration goes here
    grunt.initConfig({


        pkg: grunt.file.readJSON('package.json'),


        // File watching task
        watch: {
            codeBase: {

                options: {
                    spawn: false
                },
                // Files to watch for changes
                files: ['app/**', '!app/deploy/**'],

                tasks: [
                    'less:indexStyles',
                    'less:loginStyles',
                    'replace:loginCSS',
                    'replace:indexCSS',
                    'replace:loginHTML',
                    'replace:indexHTML',
                    'shell:multiBrowserify'
                    ]
            }
        },

        less: {

            // Index page custom styles
            indexStyles: {
                expand: true, // set to true to enable options following options:
                cwd: "app/pages/index/less/", // all sources relative to this path
                src: "index.less", // source folder patterns to match, relative to cwd
                dest: "app/deploy/assets/styles", // destination folder path prefix
                ext: ".css", // replace any existing extension with this value in dest folder
                options: {
                    relativeUrls: false,
                    compress: true,
                    // LESS source maps
                    // To enable, set sourceMap to true and update sourceMapRootpath based on your install
                    sourceMap: true,
                    sourceMapFilename: "app/deploy/assets/styles/index.css.map",

                }
            },

            // Index page custom styles
            loginStyles: {
                expand: true, // set to true to enable options following options:
                cwd: "app/pages/login/less/", // all sources relative to this path
                src: "login.less", // source folder patterns to match, relative to cwd
                dest: "app/deploy/assets/styles", // destination folder path prefix
                ext: ".css", // replace any existing extension with this value in dest folder
                options: {
                    relativeUrls: false,
                    compress: true,
                    // LESS source maps
                    // To enable, set sourceMap to true and update sourceMapRootpath based on your install
                    sourceMap: true,
                    sourceMapFilename: "app/deploy/assets/styles/login.css.map"

                }
            }
        },

        // Grunt execution of some Bash stuff;
        shell: {

            // Browserify script resources;
            // Make source maps separate files (exorcist);
            // Add cache busting querying string to source mapping URL
            multiBrowserify: {
                command: [
                    'browserify app/pages/index/index.require.js --debug | exorcist app/deploy/assets/scripts/index.js.map > app/deploy/assets/scripts/index.js',
                    'echo "?"`date +%s` >>  app/deploy/assets/scripts/index.js',

                    'browserify app/pages/login/login.require.js --debug | exorcist app/deploy/assets/scripts/login.js.map > app/deploy/assets/scripts/login.js',
                    'echo "?"`date +%s` >>  app/deploy/assets/scripts/login.js',


                ].join('&&')
            },

            multiBrowserifyBuild: {
                command: [
                    'browserify build/pages/index/index.require.js --debug | exorcist build/deploy/assets/scripts/index.js.map > build/deploy/assets/scripts/index.js',
                    'echo "?"`date +%s` >>  build/deploy/assets/scripts/index.js',

                    'browserify build/pages/login/login.require.js --debug | exorcist build/deploy/assets/scripts/login.js.map > build/deploy/assets/scripts/login.js',
                    'echo "?"`date +%s` >>  build/deploy/assets/scripts/login.js',
                ].join('&&')
            },

            compress: {
                command : 'tar -zcvf ship/build.tar.gz build'
            },

            scp : {
                command : [
                    'scp -i ' + pem + ' ship/build.tar.gz '+ hostUser + '@' + hostIp + ':'+ hostPath,
                    'scp -i ' + pem + ' publish.sh '+ hostUser + '@' + hostIp + ':'+ hostPath
                ].join('&&')
            }
        },

        clean: {
            build: ["build/**"]
        },

        copy : {

            build : {
                files: [ {expand: true, cwd: 'app/', src: ['**'], dest: 'build/'}]
            }
        },

        replace: {
            loginHTML : {
                src: ['build/deploy/login.html'],
                overwrite: true,
                replacements: [
                    {
                        from: 'src="assets/scripts/login.js"',
                        to: function(){return 'src="assets/scripts/login.js?' + dateStamp() +'"'}
                    },
                    {
                    from: 'href="/assets/styles/login.css"',
                    to: function(){return 'href="assets/styles/login.css?' + dateStamp() +'"'}
                    },
                    {
                        from: '<!-- Rollbar -->',
                        to: function(){return rollbar(config.rollbarKey);}
                    }]
            },

            indexHTML : {
                src: ['build/deploy/index.html'],
                overwrite: true,
                replacements: [
                    {
                        from: 'src="assets/scripts/index.js"',
                        to: function(){return 'src="assets/scripts/index.js?' + dateStamp() +'"'}
                    },
                    {
                        from: 'href="assets/styles/index.css"',
                        to: function(){return 'href="assets/styles/index.css?' + dateStamp() +'"'}
                    },
                    {
                        from: '<!-- Rollbar -->',
                        to: function(){return rollbar(config.rollbarKey);}
                    }]
            },

            loginCSS: {
                src: ['app/deploy/assets/styles/login.css','build/deploy/assets/styles/login.css'],
                overwrite: true,
                replacements: [{
                    from: 'sourceMappingURL=app/deploy/assets/styles/login.css.map',
                    to: 'sourceMappingURL=login.css.map'
                }]
            },
            indexCSS: {
                src: ['app/deploy/assets/styles/index.css','build/deploy/assets/styles/index.css'],
                overwrite: true,
                replacements: [{
                    from: 'sourceMappingURL=app/deploy/assets/styles/index.css.map',
                    to: 'sourceMappingURL=index.css.map'
                }]
            },

            settings: {
                src: ['build/shared/modules/settings.module.js'],
                overwrite: true,
                replacements: [{
                    from: '"apiHost": "http://localhost:3333/"',
                    to: function(){return '"apiHost": "' + config.environment[env].apiHost + '/"'}
                }]
            }
        },

        html2js: {
            options: {
                // custom options, see below
            },
            main: {
                src: ['app/deploy/header.html'],
                dest: 'app/shared/templates.js'
            }
        }
    });

    // Tell Grunt we plan to use these plug-ins.
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-scp');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-html2js');

    grunt.registerTask('build', [
        'clean:build',
        'copy:build',
        'replace:loginHTML', 'replace:indexHTML', 'replace:loginCSS', 'replace:indexCSS','replace:settings',
        'shell:multiBrowserifyBuild'
    ]);

    // The build and 'deploy' task
    grunt.registerTask('build-push', [
        'clean:build',
        'copy:build',
        'replace:loginHTML', 'replace:indexHTML', 'replace:loginCSS', 'replace:indexCSS','replace:settings',
        'shell:multiBrowserifyBuild',
        'shell:compress', 'shell:scp'
    ]);



};