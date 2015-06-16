module.exports = function(grunt) {
 
grunt.initConfig({
    sass: {
        options: {
            outputStyle: 'compressed',
            compass: 'true'
        },
        dist: {
          files: {
              'styles/styles.css': 'source/bootstrap-sass-official/assets/stylesheets/application.scss',
          }
        }
    },

    uglify: {
        js: {
            src:['source/angular/angular.js','source/angular-route/angular-route.js','source/angular-cookies/angular-cookies.js','source/angular-scripts.js'],
            dest:'scripts/angular-final.js'
        }
    },

    watch: {

        css: {
            files: ['source/bootstrap-sass-official/assets/**/*.scss'],
            tasks: ['sass']
        },

        scripts: {
            files: ['source/angular-scripts.js'],
            tasks: ['uglify']
        }
    }
});

grunt.loadNpmTasks('grunt-sass');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-contrib-uglify');

grunt.registerTask('default', ['sass','uglify']);

};