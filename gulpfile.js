global.hostname = "localhost";

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    compass = require('gulp-compass'),
    autoprefixer = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    minifycss = require('gulp-minify-css'),
    notify = require("gulp-notify"),
    opn = require('opn'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    concat = require('gulp-concat');


//****************************************************************************
//gulp
gulp.task('express', function() {
    var express = require('express');
    var app = express();
    app.use(require('connect-livereload')({port: 35729}));
    app.use(express.static(__dirname + '/app'));
    app.listen('8080', hostname);
    opn('http://localhost:8080');
});

//****************************************************************************
//livereload
var tinylr;
gulp.task('livereload', function() {
    tinylr = require('tiny-lr')();
    tinylr.listen(35729);
});

function notifyLiveReload(event) {
    var fileName = require('path').relative(__dirname, event.path);
    tinylr.changed({
        body: {
            files: [fileName]
        }
    });
}

//****************************************************************************
gulp.task('sass', function() {
    return gulp.src('sass/*.scss')
    .pipe(compass({
        config_file: './config.rb',
        css: 'app/css',
    }))
    .pipe(autoprefixer({
         browsers: ['last 15 versions'],
         cascade: false
    }))
    .pipe(gulp.dest('app/css'))   

    .pipe(rename({
        suffix: '.min', 
        prefix : '_'
    }))
    .pipe(minifycss())
    .pipe(gulp.dest('app'))    
});

//****************************************************************************
 // Lint Task
gulp.task('lint', function() {
    return gulp.src('app/myscript/common.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

//****************************************************************************
// Uglify
 
gulp.task('uglify', function() {
  return gulp.src('app/myscript/*.js')
    .pipe(uglify('app.js', {
      mangle: false,
      output: {
        beautify: true
      }
    }))
    .pipe(rename({
        suffix: '.min', 
        prefix : '_'
    }))
    .pipe(gulp.dest('app/js'));
});

//****************************************************************************
//Concatenate & Minify JS

gulp.task('scripts', function() {
    return gulp.src(['app/libs/**/*.min.js',])
        .pipe(concat('all.js'))
        .pipe(rename({
        suffix: '.min', 
        prefix : '_'
    }))
        .pipe(gulp.dest('app/js'));
});
//****************************************************************************
 
//****************************************************************************
// Images

gulp.task('images', function() {
  return gulp.src('app/img/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(livereload(tinylr))
    .pipe(gulp.dest('app/img'))
    .pipe(notify({ message: 'Images task complete' }));
});

//****************************************************************************

//watch
gulp.task('watch', function() {
    gulp.watch('sass/*.scss', ['sass']);
    gulp.watch('app/myscript/*.js', ['lint', 'uglify']);
    gulp.watch('app/*.css', notifyLiveReload);
    gulp.watch('app/css/*.css', notifyLiveReload);
    gulp.watch('app/*.html', notifyLiveReload);
    gulp.watch('app/myscript/*.js', notifyLiveReload);
});
 

gulp.task('default', ['lint', 'express', 'livereload','sass', 'watch', 'uglify'], function() {

});
//****************************************************************************
