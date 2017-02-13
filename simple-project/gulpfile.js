var del = require('del'), //从pipeline流中删除文件
    vinylPaths = require('vinyl-paths'), //获取stream中每个文件的路径，传给del
    webpack = require('gulp-webpack'), //在gulp中插入webpack
    gulp = require('gulp'),
    browserSync = require('browser-sync').create(), //实时刷新
    reload = browserSync.reload,
    runSequence = require('run-sequence'), //规定task执行顺序
    clean = require("gulp-clean"), //删除文件和目录
    rev = require('gulp-rev'), //文件名加MD5后缀
    plumber = require('gulp-plumber'), //保证某一steam报错后下面的steam继续执行
    pug = require('gulp-pug'), //解析pug文件
    rename = require('gulp-rename'), //文件重命名
    concat = require('gulp-concat'), //合并文件
    uglify = require('gulp-uglify'), //js压缩
    cleanCSS = require('gulp-clean-css'), //css压缩
    autoprefixer = require('gulp-autoprefixer'), //自动为css添加前缀以适配不同浏览器
    sass = require('gulp-sass'), //编译scss
    inject = require('gulp-inject'), //自动插入静态文件到html
    replace = require('gulp-replace'), //自动更换图片前缀
    gulpUtil = require("gulp-util"); //打印日志

var webpackConfig = require('./webpack.config.js');

var path = {
    resources: {
        sass: './resources/scss/',
        js: './resources/js/',
        commonjs: './resources/common/js/',
        commoncss: './resources/common/css/',
        pug: './resources/tpl/',
        css: './resources/css/*.css',
        html: './resources/html/*.page.html',
        img: './resources/img/'
    },
    static: {
        css: './static/css/',
        js: './static/js/',
        html: './static/',
        img: './static/img/'
    },
    dist: {
        css: './dist/css/',
        js: './dist/js/',
        html: './dist/',
        img: './dist/img/'
    }
}

var entry = {
    sass: '*.scss',
    customjs: 'index.js',
    js: '*.js',
    css: '*.css',
    img: '*',
    html: '*.html',
    pug: '*.page.pug'
}

gulp.task('clean-static', function() {
    return gulp.src(path.static.html)
        .pipe(clean());
})

/* img处理 */
gulp.task('img', function() {
    return gulp.src(path.resources.img+entry.img)
        .pipe(plumber())
        .pipe(gulp.dest(path.static.img))
})

/* css操作 */
/* 编译sass */
gulp.task('customcss', function() {
    return gulp.src(path.resources.sass+entry.sass)
        .pipe(plumber())
        .pipe(sass().on('error', gulpUtil.log))
        .pipe(autoprefixer({
            browsers: ['> 5%', 'safari 5', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'] //兼容版本
        }))
        // .pipe(concat("demo.css")) 
        // .pipe(gulpIf(sourcemap, sourcemaps.write("../sourcemap", {
        //  addComment: true,
        //  sourceRoot: "../css/"
        // })))
        .pipe(concat('custom.css'))//合并全部css文件为一个文件
        .pipe(cleanCSS({
            advanced: false, //类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
            compatibility: 'ie7', //保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
            keepBreaks: false //类型：Boolean 默认：false [是否保留换行]}))
        }))
        .pipe(rev())
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(gulp.dest(path.static.css));
})

/*整合common.css*/
gulp.task('commoncss', function() {
    return gulp.src(path.resources.commoncss+entry.css)
        .pipe(concat('common.css'))
        .pipe(cleanCSS({
            advanced: false, //类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
            compatibility: 'ie7', //保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
            keepBreaks: false //类型：Boolean 默认：false [是否保留换行]}))
        }))
        .pipe(rev())
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(gulp.dest(path.static.css));

})

/* js操作 */
/*整合common.js*/
gulp.task('commonjs', function() {
    return gulp.src(path.resources.commonjs+entry.js)
        .pipe(plumber())
        .pipe(concat('common.js'))
        .pipe(plumber())
        .pipe(uglify().on('error', gulpUtil.log))
        .pipe(rev())
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(gulp.dest(path.static.js))
})
/*整合custom.js*/
gulp.task('customjs', function() {
    return gulp.src(path.resources.js+entry.customjs)
        .pipe(plumber())
        .pipe(webpack(webpackConfig))
        .pipe(uglify().on('error', gulpUtil.log))
        .pipe(rev())
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(gulp.dest(path.static.js))
})

/* pug操作 */
gulp.task('pug', function() {
    return gulp.src(path.resources.pug+entry.pug)
        .pipe(pug({
            pretty: true
        }))
        .pipe(replace(/\@{3}PREFIX\@{3}/g, '.'))
        .pipe(gulp.dest(path.static.html))
})

/*向html模板插入静态资源*/
gulp.task('injectjs', function() {
    var sources = gulp.src(path.static.js+'*.js', {read: false});
    return gulp.src('./static/*.page.html')
        .pipe(inject(sources, {relative: true}))
        .pipe(gulp.dest(path.static.html))
        .pipe(reload({stream: true}))
})

gulp.task('injectcss', function() {
    return gulp.src('./static/*.page.html')
        .pipe(inject(gulp.src(path.static.css+'*.css', {read: false}), {relative: true}))
        .pipe(gulp.dest(path.static.html))
        .pipe(reload({stream: true}))
})

gulp.task('browser-sync', function() {
    files: "**",
    //更改默认端口
    browserSync.init({
        server: {
            baseDir: './',
            directory: true,
            index: ""
        },
        port: 8880, //端口号
        ui: {
            port: 8091
        }
    });
});

gulp.task('html', function() {
    runSequence('pug', 'injectjs', 'injectcss')
})

gulp.task('cusjs', function() {
    runSequence('customjs', 'injectjs')
})

gulp.task('comjs', function() {
    runSequence('commonjs', 'injectjs')
})

gulp.task('css', function() {
    runSequence('commoncss', 'injectcss');
})

gulp.task('sass', function() {
    runSequence('customcss', 'injectcss')
})

gulp.task('default', ['browser-sync'], function() {
    runSequence('clean-static', ['img', 'pug','customcss', 'commoncss', 'customjs', 'commonjs'], 'injectjs', 'injectcss');
    gulp.watch(path.resources.commoncss, ["css"]);
    gulp.watch(path.resources.sass, ["sass"]);
    gulp.watch(path.resources.commonjs, ["comjs"]);
    gulp.watch(path.resources.js, ["cusjs"]);
    gulp.watch(path.resources.pug, ['html']);
});


/*build for production*/
gulp.task('clean-dist', function() {
    return gulp.src(path.dist.html)
        .pipe(clean());
})

gulp.task('copy', function() {
    return gulp.src(path.static.html+'*/*')
        .pipe(gulp.dest(path.dist.html))
})

/* pug操作 */
gulp.task('pug-build', function() {
    return gulp.src(path.resources.pug+entry.pug)
        .pipe(pug({
            pretty: true
        }))
        .pipe(replace(/\@{3}PREFIX\@{3}/g, 'http://chexiang.sit.com'))
        .pipe(gulp.dest(path.dist.html))
})

gulp.task('inject', function() {
    var js = gulp.src(path.dist.js+entry.js, {read: false});
    var css = gulp.src(path.dist.css+entry.css, {read: false});
    var prefix = 'http://chexiang.sit.com'; //静态资源链接
    return gulp.src(path.dist.html+entry.html)
        .pipe(inject(js, {addPrefix: prefix, relative: true}))
        .pipe(inject(css, {addPrefix: prefix, relative: true}))
        .pipe(gulp.dest(path.dist.html))
})

gulp.task('build', function() {
    runSequence('clean-dist', 'copy', 'pug-build', 'inject')
})