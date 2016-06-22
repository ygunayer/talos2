'use strict';

var gulp = require('gulp'),
    del = require('del'),
    gulpif = require('gulp-if'),
    gutil = require('gulp-util'),
    stylus = require('gulp-stylus'),
    uglify = require('gulp-uglify'),
    buffer = require('vinyl-buffer'),
    nodemon = require('gulp-nodemon'),
    browserify = require('browserify'),
    runSequence = require('run-sequence'),
    source = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    ngAnnotate = require('gulp-ng-annotate');

var paths = {
    styles: {
        src: [ './client/styles/**/*.styl' ],
        dest: './public/css'
    },
    scripts: {
        entry: './client/scripts/app.js',
        src: [ './client/scripts/**/*.js' ],
        bundleName: 'bundle.js',
        dest: './public/js/'
    },
    server: {
        entry: './app.js',
        watch: [ './server' ]
    }
};

var isDev = false;

/** Clean up previous build */
gulp.task('clean', function() {
    return del([ './public' ]);
});

/** Process styles */
gulp.task('styles', function() {
    return gulp.src(paths.styles.src)
        .pipe(stylus({
            compress: !isDev,
            'include css': true,
            linenos: false
        }))
        .pipe(gulp.dest(paths.styles.dest));
});

/** Process client-side scripts */
gulp.task('scripts', function() {
    var b = browserify({
        entries: paths.scripts.entry,
        debug: isDev
    });

    var ret = b.bundle()
        .pipe(source(paths.scripts.bundleName))
        .pipe(buffer())
        .pipe(ngAnnotate());
        
    if (!isDev) {
        ret = ret
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(uglify())
            .on('error', gutil.log)
        .pipe(sourcemaps.write('./'));
    }

    return ret.pipe(gulp.dest(paths.scripts.dest));
});

/** Watch for changes in style files and re-run task "styles" on change */
gulp.task('watch:styles', [ 'styles' ], function() {
    gulp.watch(paths.styles.src, [ 'styles' ]);
});

/** Watch for changes in client-side scripts and re-run task "scripts" on change */
gulp.task('watch:scripts', [ 'scripts' ], function() {
    gulp.watch(paths.scripts.src, [ 'scripts' ]);
});

/** Watch for changes in server scripts and restart server on change */
gulp.task('watch:server', function() {
    nodemon({
        script: paths.server.entry,
        watch: paths.server.watch,
        ext: 'js'
    });
});

/** Run in development mode by default */
gulp.task('default', [ 'dev' ]);

/** Development mode */
gulp.task('dev', [ 'clean' ], function(next) {
    isDev = true;
    runSequence('watch:styles', 'watch:scripts', 'watch:server');
});

/** Production mode */
gulp.task('dist', function() {
    isDev = false;
    runSequence('clean', 'styles', 'scripts');
});
