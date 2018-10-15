let tmplFolder = 'tmpl'; //template folder
let srcFolder = 'src'; //source folder
let buildFolder = 'build';

let gulp = require('gulp');
let watch = require('gulp-watch');
let del = require('del');
let fs = require('fs');
let ts = require('typescript');
let concat = require('gulp-concat');
let combineTool = require('../magix-combine/index');

combineTool.config({
    debug: true,
    commonFolder: tmplFolder,
    compiledFolder: srcFolder,
    cssSelectorPrefix: 'p',
    loaderType: 'cmd',
    md5CssSelectorLen: 3,
    //magixVframeHost:true,
    addTmplViewsToDependencies: true,
    magixUpdaterIncrement: true,
    magixUpdaterQuick: true,
    magixTmplFnInside: false,
    galleries: {
        mxRoot: 'gallery/'
    },
    scopedCss: [
        './tmpl/gallery/mx-style/index.less'
    ],
    compileTmplCommand(content) {
        var str = ts.transpileModule(content, {
            compilerOptions: {
                lib: ['es7'],
                target: 'es3',
                module: ts.ModuleKind.None
            }
        });
        str = str.outputText;
        return str;
    },
    compileJSStart(content) {
        var str = ts.transpileModule(content, {
            compilerOptions: {
                lib: ['es7'],
                target: 'es3',
                module: ts.ModuleKind.None
            }
        });
        str = str.outputText;
        return str;
    }
});

gulp.task('cleanSrc', () => del(srcFolder));

gulp.task('combine', ['cleanSrc'], () => {
    return combineTool.combine().then(() => {
        console.log('complete');
    }).catch(function (ex) {
        console.log('gulpfile:', ex);
        process.exit();
    });
});

gulp.task('watch', ['combine'], () => {
    watch(tmplFolder + '/**/*', e => {
        if (fs.existsSync(e.path)) {
            var c = combineTool.processFile(e.path);
            c.catch(function (ex) {
                console.log('ex', ex);
            });
        } else {
            combineTool.removeFile(e.path);
        }
    });
});

var uglify = require('gulp-uglify');
gulp.task('cleanBuild', function () {
    return del(buildFolder);
});

gulp.task('build', ['cleanBuild', 'cleanSrc'], function () {
    combineTool.config({
        debug: false
    });
    combineTool.combine().then(() => {
        gulp.src(srcFolder + '/**/*.js')
            .pipe(uglify({
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                    global_defs: {
                        DEBUG: false
                    }
                }
            }))
            .pipe(gulp.dest(buildFolder));
    }).catch(ex => {
        console.error(ex);
    });
});

gulp.task('dist', ['cleanSrc'], () => {
    return del('./dist').then(() => {
        combineTool.config({
            debug: false
        });
        return combineTool.combine();
    }).then(() => {
        return gulp.src([
            './src/table.js',
            './src/gallery/**',
            './src/i18n/**',
            './src/element/**',
            './src/app/**'])
            .pipe(concat('table.js'))
            .pipe(gulp.dest('./dist'));
    }).then(() => {
        return gulp.src('./dist/*.js')
            .pipe(uglify({
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                    global_defs: {
                        DEBUG: false
                    }
                },
                output: {
                    ascii_only: true
                }
            }))
            .pipe(gulp.dest('./dist'));
    });
});

gulp.task('cdist', () => {
    return gulp.src('./dist/*.js')
        .pipe(uglify({
            compress: {
                drop_console: true,
                drop_debugger: true,
                global_defs: {
                    DEBUG: false
                }
            },
            output: {
                ascii_only: true
            }
        }))
        .pipe(gulp.dest('./dist'));
});
