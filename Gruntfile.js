'use strict';

module.exports = function(grunt) {
  var watchFiles = {
    serverViews: ['views/**/*.jade'],
    serverJS: ['Gruntfile.js', 'app.js', 'routes/**/*.js', 'controllers/**/*.js',
      'brokers/**/*.js', 'middleware/**/*.js', 'db/**/*.js'],
    clientCSS: ['public/*.css']
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      serverViews: {
        files: watchFiles.serverViews,
        options: {
          livereload: true
        }
      },
      serverJS: {
        files: watchFiles.serverJS,
        tasks: ['jshint'],
        options: {
          livereload: true
        }
      }
    },
    copy: {
      js: {
        files: [
          {expand: true, flatten: true, cwd: 'bower_components', dest: 'public/lib/js', src: [
            'jquery/dist/jquery.js',
            'lodash/dist/lodash.js',
            'jplayer/dist/jplayer/jquery.jplayer.js',
            'bootstrap/dist/js/bootstrap.js',
            'bootstrap-tagsinput/dist/bootstrap-tagsinput.js',
            'socket.io-client/socket.io.js'
          ]}
        ]
      },
      swf: {
        files: [
          {expand: true, flatten: true, cwd: 'bower_components', dest: 'public/lib/swf', src: [
            'jplayer/dist/jplayer/jquery.jplayer.swf'
          ]}
        ]
      },
      css: {
        files: [
          {expand: true, flatten: true, cwd: 'bower_components', dest: 'public/lib/css', src: [
            'bootstrap/dist/css/bootstrap.css',
            'bootstrap-tagsinput/dist/bootstrap-tagsinput.css',
            'jplayer/dist/skin/blue.monday/css/jplayer.blue.monday.css'
          ]},
          {expand: true, flatten: true, cwd: 'bower_components', dest: 'public/lib/css', src: [
            'font-awesome/css/font-awesome.css'
          ]}
        ]
      },
      images: {
        files: [
          {expand: true, flatten: true, cwd: 'bower_components', dest: 'public/lib/image', src: [
            'jplayer/dist/skin/blue.monday/image/jplayer.blue.monday.jpg',
            'jplayer/dist/skin/blue.monday/image/jplayer.blue.monday.seeking.gif',
            'jplayer/dist/skin/blue.monday/image/jplayer.blue.monday.video.play.png'
          ]}
        ]
      },
      fonts: {
        files: [
          {expand: true, flatten: true, cwd: 'bower_components', dest: 'public/lib/fonts', src: [
            'bootstrap/fonts/glyphicons-halflings-regular.eot',
            'bootstrap/fonts/glyphicons-halflings-regular.svg',
            'bootstrap/fonts/glyphicons-halflings-regular.ttf',
            'bootstrap/fonts/glyphicons-halflings-regular.woff',
            'bootstrap/fonts/glyphicons-halflings-regular.woff2',
            'font-awesome/fonts/fontawesome-webfont.eot',
            'font-awesome/fonts/fontawesome-webfont.svg',
            'font-awesome/fonts/fontawesome-webfont.ttf',
            'font-awesome/fonts/fontawesome-webfont.woff',
            'font-awesome/fonts/fontawesome-webfont.woff2'
          ]}
        ]
      }
    },
    nodemon: {
      dev: {
        script: 'app.js',
        options: {
          nodeArgs: ['--debug'],
          ext: 'js,jade',
          watch: watchFiles.serverViews.concat(watchFiles.serverJS)
        }
      }
    },
    concurrent: {
      default: ['nodemon', 'watch'],
      debug: ['nodemon', 'watch', 'node-inspector'],
      options: {
        logConcurrentOutput: true,
        limit: 10
      }
    },
    bower: {
      install: {
        options: {
          targetDir: './bower_components'
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);
  grunt.option('force', true);

  grunt.registerTask('default', ['copy', 'lint', 'concurrent:default']);
  grunt.registerTask('debug', ['lint', 'concurrent:debug']);
  grunt.registerTask('lint', ['jshint', 'csslint']);

  var seed = require('./tasks/seed');
  grunt.task.registerTask('seed', 'Seeds default data', seed);

  grunt.registerTask('install', ['npm-install', 'bower:install', 'seed']);
};
