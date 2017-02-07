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
    gulpUtil = require("gulp-util"); //打印日志

var webpackConfig = require('./webpack.config.js');

var path = {
    resources: {
        sass: './resources/scss/*.scss',
        js: './resources/js/index.js',
        commonjs: './resources/common/js/*.js',
        commoncss: './resources/common/css/*.css',
        pug: './resources/tpl/*.page.pug',
        css: './resources/css/*.css',
        html: './resources/html/*.page.html',
        img: './resources/img/*'
    },
    catalog: {
        sass: './resources/scss/',
        js: './resources/js/',
        commonjs: './resources/common/js/',
        commoncss: './resources/common/css/',
        pug: './resources/tpl/',
        css: './resources/css/',
        html: './resources/html/',
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


gulp.task('clean', function() {
    return gulp.src([path.static.html, path.dist.html])
        .pipe(clean());
})

/* img处理 */
gulp.task('img', function() {
    return gulp.src(path.resources.img)
        .pipe(plumber())
        .pipe(gulp.dest(path.static.img))
})

/* css操作 */
/* 编译sass */
gulp.task('customcss', function() {
    return gulp.src(path.resources.sass)
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
    return gulp.src(path.resources.commoncss)
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
    return gulp.src(path.resources.commonjs)
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
    return gulp.src(path.resources.js)
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
    return gulp.src(path.resources.pug)
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest(path.static.html))
        .pipe(gulp.dest(path.dist.html))
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
    runSequence('clean', ['img', 'pug','customcss', 'commoncss', 'customjs', 'commonjs'], 'injectjs', 'injectcss');
    gulp.watch(path.resources.commoncss, ["css"]);
    gulp.watch(path.resources.sass, ["sass"]);
    gulp.watch(path.resources.commonjs, ["comjs"]);
    gulp.watch(path.resources.js, ["cusjs"]);
    gulp.watch(path.resources.pug, ['html']);
});