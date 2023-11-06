import gulp from 'gulp';
import imagemin, { gifsicle, mozjpeg, optipng, svgo } from 'gulp-imagemin';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import autoprefixer from 'autoprefixer';
import postcss from 'gulp-postcss';
import cssnano from 'cssnano';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import iconfontCSS from 'gulp-iconfont-css';
import iconfont from 'gulp-iconfont';
import fileinclude from 'gulp-file-include';
const fontName = 'iconFont';


const sass = gulpSass(dartSass);

const imageMinimase = (cb) => {
    gulp.src(['app/images/**/*.*', '!app/images/svg/*.*'])
    .pipe(imagemin([
        gifsicle({interlaced: true}),
        mozjpeg({quality: 75, progressive: true}),
        optipng({optimizationLevel: 5}),
        svgo({
            plugins: [
                {
                    name: 'removeViewBox',
                    active: true
                },
                {
                    name: 'cleanupIDs',
                    active: false
                }
            ]
        })
    ]))
    .pipe(gulp.dest('dist/img'))

    cb();
};

const buildScss = (cb) => {
    gulp.src('app/styles/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([ autoprefixer('last 2 versions'), cssnano ]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/css'))

    cb();
};

const buildJavaScript = (cb) => {
    gulp.src('app/js/*.js')          
    .pipe(concat('bundle.js'))     
    .pipe(uglify())       
    .pipe(gulp.dest('dist/js')); 

    cb();
}

const genIconFont = (cb) => {
    gulp.src(['app/images/svg/*.svg'])
    .pipe(iconfontCSS({
    fontName: fontName,
    targetPath: '../../app/styles/icons.scss',
    fontPath: '../fonts/'
    }))

    .pipe(iconfont({
        fontName: fontName,
        formats: ['svg', 'ttf', 'eot', 'woff', 'woff2'],
        normalize: true,
        fontHeight: 1001
    }))
    .pipe(gulp.dest('dist/fonts/'));

    cb();
}


const getFileinclude = (cb) => {
    gulp.src(['app/*.html'])
    .pipe(fileinclude({
        prefix: '@@',
        basepath: '@file',
        indent: true
    }))
    .pipe(gulp.dest('dist/'));

    cb()
}

const copyFont = (cb) => {
    gulp.src('app/fonts/**/*.*')
    .pipe(gulp.dest('dist/fonts'));

    cb()
}

const watch = () => {
    gulp.watch('app/styles/**/*.scss', buildScss);          
    gulp.watch('app/js/**/*.js', buildJavaScript);
    gulp.watch('app/images/svg/*.svg', genIconFont);
    gulp.watch('app/**/*.html', getFileinclude);
    gulp.watch('app/fonts/**/*.*', copyFont);
}


gulp.task('fontCopy', copyFont)
gulp.task('fileHTML', getFileinclude)
gulp.task('genIconFont', gulp.series(genIconFont, buildScss));
gulp.task('imgMin', imageMinimase);
gulp.task('buildSCSS', buildScss);
gulp.task('buildJS', buildJavaScript);

gulp.task('watch', watch);
gulp.task('build', gulp.series(genIconFont, buildScss, (seriesCB) => {
    return gulp.parallel(imageMinimase, buildJavaScript, getFileinclude, copyFont, (parallelCB) => {
        seriesCB();
        parallelCB();
    })();
}));

