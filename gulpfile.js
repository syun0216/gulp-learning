'use strict';
var path = './gulpLearning';
var gulp        = require('gulp');
var browserSync = require('browser-sync').create();//用于自动刷新
var sass        = require('gulp-sass');//用于将scss文件编译成css
var less        = require('gulp-less');//用于将less文件编译成css
var jade = require('gulp-jade');//用于编译jade模板
var concat = require("gulp-concat");//用于合并文件
var inject = require("gulp-inject");//用于在html中自动插入链接
var uglify = require('gulp-uglify');//用于压缩js
var rename = require("gulp-rename");//用于改名
var cleanCSS = require('gulp-clean-css');//用于清理css
var runSequence = require('gulp-sequence');//用于排列gulp的任务执行先后顺序
var es6transpiler = require('gulp-es6-transpiler');//用于解析es6
var del = require('del');//用于清除文件

// Static Server + watching scss/redpacket files

// Configure the browserSync task
gulp.task('browserSync', function() {
    browserSync.init({
        port: 9000,
        server: path
    });
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src(path +"/scss/*.scss")
        .pipe(sass())
        .pipe(gulp.dest(path + "/css"))
        .pipe(gulp.dest(path + "/scss"))
        .pipe(browserSync.stream());
});
gulp.task('jade',function(){
    return gulp.src(path + "/jade/*.jade")
        .pipe(jade())
        .pipe(gulp.dest(path+"/jade"))
        .pipe(browserSync.stream());
});
gulp.task('less',function () {
    return gulp.src(path+'/less/*.less')
        .pipe(less())
        .pipe(gulp.dest(path + "/css"))
        .pipe(gulp.dest(path+'/less'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

//编译es6
gulp.task('es6', function () {
    return gulp.src(path+'/es6/*.js')
        .pipe(es6transpiler())
        .pipe(gulp.dest(path+'/js/'));
});

//压缩js
gulp.task('minify-js',['inject-build'],function () {
    return gulp.src(path+'/js/*.js')
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(path+'/dist'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

//压缩css
gulp.task('minify-css', ['less'], function() {
    return gulp.src(path+'/css/*.css')
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(rename({ suffix: '.min' }))
        // .pipe(gulp.dest(path+'/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

//例子：复制node_module中的js到copy中的jquery文件夹中
gulp.task('copy',function () {
    gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
        .pipe(gulp.dest('./gulpLearning/copy/jquery'));
    gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
        .pipe(gulp.dest('./gulpLearning/copy/jquery'))
});

//移动首页index.html到dist
gulp.task('copy-html',function () {
    gulp.src(path+'/index.html').pipe(gulp.dest(path+'/dist/'))
});

//将js和css文件注入到index.html中
gulp.task('inject-build',function () {
    var target = gulp.src(path+'/index.html');
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    // var sources = gulp.src([path+'/copy/jquery/*.min.js',path+'/js/*.min.js', path+'/css/*.min.css'], {read: false});
    var sources = gulp.src([path+'/dist/*.min.js', path+'/dist/*.min.css'], {read: false});

    return target.pipe(inject(sources))
        .pipe(gulp.dest(path));
});

//开发者模式inject
gulp.task('inject-dev',function () {
    var target = gulp.src(path+'/index.html');
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    var sources = gulp.src([path+'/copy/jquery/*.min.js',path+'/js/*.min.js', path+'/css/*.min.css'], {read: false});

    return target.pipe(inject(sources))
        .pipe(gulp.dest(path));
});

//合并css文件
gulp.task('concat',function() {
    return gulp.src(path+'/css/*.css')
        .pipe(concat('main.min.css'))
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(gulp.dest(path+'/dist/'));
});

//开发者模式
gulp.task('dev', ['browserSync','sass','less','jade'], function(cb) {
    gulp.watch(path + "/scss/*.scss", ['sass']);
    gulp.watch(path + "/less/*.less", ['less']);
    // gulp.watch("songshui/jade/*.jade",['jade']);
    gulp.watch(path + "/*.jade",['jade']);
    gulp.watch(path + "/*.*").on('change', browserSync.reload);
    gulp.watch(path + "/**/*.*").on('change', browserSync.reload);
});

//生成产品
gulp.task('build',function (cb) {
    runSequence('concat','minify-js','inject-build','copy-html')(cb);
});

//清除dist文件
gulp.task('delete',function (cb) {
    del(path+'/dist/', cb);
});

gulp.task('default', ['serve']);