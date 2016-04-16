'use strict';

var gulp = require('gulp'),
    del = require('del'),
    gulpif = require('gulp-if'),
    gutil = require('gulp-util'),
    stylus = require('gulp-stylus'),
    uglify = require('gulp-uglify'),
    buffer = require('vinyl-buffer'),
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
    }
};

var isDev = false;

gulp.task('clean', function() {
    return del([ './public' ]);
});

gulp.task('styles', function() {
    return gulp.src(paths.styles.src)
        .pipe(stylus({
            compress: !isDev,
            linenos: false
        }))
        .pipe(gulp.dest(paths.styles.dest));
});
gulp.task('watch:styles', [ 'styles' ], function() {
    gulp.watch(paths.styles.src, [ 'styles' ]);
});

gulp.task('scripts', function() {
    var b = browserify({
        entries: paths.scripts.entries,
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
gulp.task('watch:scripts', [ 'scripts' ], function() {
    gulp.watch(paths.scripts.src, [ 'scripts' ]);
});

gulp.task('default', [ 'development' ]);

gulp.task('development', [ 'clean' ], function(next) {
    isDev = true;
    runSequence('watch:styles', 'watch:scripts');
});

gulp.task('production', function() {
    isDev = false;
    runSequence('clean', 'styles', 'scripts');
});
