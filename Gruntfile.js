var path = require('path');
var config = require('./deploy-config.json');
var rollbar = require('./rollbar');

function dateStamp(){
    return new Date().getTime();
}

function cssSourceMapReplace(cssFilePath){

    var cssFilename = path.basename(cssFilePath);

    return {
        src: [cssFilePath],
        overwrite: true,
        replacements: [{
            from: 'sourceMappingURL='+ cssFilePath + '.map',
            to: 'sourceMappingURL=' + cssFilename + '.map'
        }]
    }
}

function appPageReplace(srcPath, appJsFilePath, appCssFilePath){
    return {
        src: [srcPath],
        overwrite: true,
        replacements: [
            {
                from: 'src="'+ appJsFilePath +'"',
                to: function(){return 'src="' + appJsFilePath + '?' + dateStamp() +'"'}
            },
            {
                from: 'href="'+ appCssFilePath +'"',
                to: function(){return 'href="'+ appCssFilePath +'?' + dateStamp() +'"'}
            },
            {
                from: '<!-- Rollbar -->',
                to: function(){return rollbar(config.rollbarKey);}
            }
        ]
    }
}

function appPageBrowserify(requireFilePath, resultFilePath, sourceMapFilePath, id){

    return 'browserify ' + requireFilePath + ' --debug | exorcist ' + sourceMapFilePath + ' > ' + resultFilePath
        + ' && echo "?"' + id + '`date +%s` >> ' + resultFilePath;

}

function appPageLessCompile(lessFilePath, cssFileDestPath, sourceMapFilePath) {

    var lessDir = path.dirname(lessFilePath) + '/';
    var lessFile = path.basename(lessFilePath);
    return {
        expand: true, // set to true to enable options following options:
        cwd: lessDir, // all sources relative to this path
        src: lessFile, // source folder patterns to match, relative to cwd
        dest: cssFileDestPath, // destination folder path prefix
        ext: ".css", // replace any existing extension with this value in dest folder
        options: {
            relativeUrls: false,
            compress: true,
            sourceMap: true,
            sourceMapFilename: sourceMapFilePath

        }
    };
}

module.exports = function(grunt) {

    var env = grunt.option('env') || 'development';

    if(env === 'production' || env === 'staging') {
        var hostIp = config.environment[env].hostIp;
        var hostPath = config.environment[env].hostPath;
        var hostUser = config.environment[env].hostUsername;
        var pem = config.environment[env].pemFilePath;

    }

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
                files: ['app/**', '!app/deploy/assets/**'],

                tasks: [
                    'less:indexStyles',
                    'less:loginStyles',
                    'replace:localLoginCSS',
                    'replace:localIndexCSS',
                    'replace:localLoginHTML',
                    'replace:localIndexHTML',
                    'html2js:header',
                    'shell:multiBrowserify'
                    ]
            }
        },

        less: {

            // Index page custom styles
            indexStyles: appPageLessCompile('app/pages/index/less/index.less', 'app/deploy/assets/styles',
                'app/deploy/assets/styles/index.css.map'),

            // Index page custom styles
            loginStyles: appPageLessCompile('app/pages/login/less/index.less', 'app/deploy/assets/styles',
                'app/deploy/assets/styles/login.css.map')
        },

        // Grunt execution of some Bash stuff;
        shell: {

            // Browserify script resources; source maps as separate files (exorcist);
            // Add cache busting querying string to source mapping URL
            multiBrowserify: {
                command: [
                    appPageBrowserify('app/pages/index/index.require.js', 'app/deploy/assets/scripts/index.js',
                        'app/deploy/assets/scripts/index.js.map', 'index'),
                    appPageBrowserify('app/pages/login/login.require.js', 'app/deploy/assets/scripts/login.js',
                        'app/deploy/assets/scripts/login.js.map', 'login')

                ].join('&&')
            },

            multiBrowserifyBuild: {
                command: [
                    appPageBrowserify('build/pages/index/index.require.js', 'build/deploy/assets/scripts/index.js',
                        'build/deploy/assets/scripts/index.js.map', 'index'),
                    appPageBrowserify('build/pages/login/login.require.js', 'build/deploy/assets/scripts/login.js',
                        'build/deploy/assets/scripts/login.js.map', 'login')
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
            localLoginHTML : appPageReplace('app/deploy/login.html', 'assets/scripts/login.js', 'assets/styles/login.css'),

            localIndexHTML : appPageReplace('app/deploy/index.html', 'assets/scripts/index.js', 'assets/styles/index.css'),

            buildLoginHTML : appPageReplace('build/deploy/login.html', 'assets/scripts/login.js', 'assets/styles/login.css'),

            buildIndexHTML : appPageReplace('build/deploy/index.html', 'assets/scripts/index.js', 'assets/styles/index.css'),

            localLoginCSS:  cssSourceMapReplace('app/deploy/assets/styles/login.css'),

            buildLoginCSS: cssSourceMapReplace('build/deploy/assets/styles/login.css'),

            localIndexCSS : cssSourceMapReplace('app/deploy/assets/styles/index.css'),

            buildIndexCSS: cssSourceMapReplace('build/deploy/assets/styles/index.css'),

        },

        html2js: {
            options: {
                // custom options, see below
            },
            header: {
                src: ['app/deploy/header.html'],
                dest: 'app/shared/templates-header.js'
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
        'replace:buildLoginHTML', 'replace:builIndexHTML', 'replace:buildLoginCSS', 'replace:buildIndexCSS',
        'shell:multiBrowserifyBuild'
    ]);

    // The build and 'deploy' task
    grunt.registerTask('build-push', [
        'build',
        'shell:compress', 'shell:scp'
    ]);



};