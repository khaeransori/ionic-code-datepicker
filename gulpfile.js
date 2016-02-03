var gulp       = require('gulp');
var del        = require('del');
var concat     = require('gulp-concat');
var css2js     = require("gulp-css2js");
var minifyHtml = require("gulp-htmlmin");
var ngHtml2Js  = require("gulp-ng-html2js");
var uglify     = require('gulp-uglify');
var sass       = require('gulp-sass');
var ngAnnotate = require('gulp-ng-annotate');

gulp.task('html2js', function() {
    return gulp.src(['./src/templates/*.html'])
        .pipe(minifyHtml())
        .pipe(ngHtml2Js({
            moduleName: "code-datepicker.templates"
        }))
        .pipe(concat("templates.js"))
        .pipe(uglify())
        .pipe(gulp.dest("./dist"));
});

gulp.task('sass2css', function() {
    gulp.src('./src/style/code-datepicker.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./src/style/'));
});

gulp.task('css2js', function() {
    return gulp.src("./src/style/code-datepicker.css")
        .pipe(css2js())
        .pipe(uglify())
        .pipe(gulp.dest("./dist/"));
});

gulp.task('minify-all', ['delete-dist', 'html2js', 'sass2css', 'css2js'], function() {
    return gulp.src(['./dist/*.js', './src/js/*.js'])
        .pipe(concat('code-datepicker.min.js'))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(gulp.dest('dist/'));
});

gulp.task('delete-dist', function() {
    del(['dist/*']);
});

gulp.task('delete-trash', ['minify-all'], function() {
    del(['dist/templates.js', 'dist/code-datepicker.js']);
});

gulp.task('default', ['delete-trash'], function() {});
