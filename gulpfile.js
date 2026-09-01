const { src, dest, watch, parallel, series } = require('gulp');
const fs = require('fs');

const less = require('gulp-less');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer').default;
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const ttf2woff2 = require('gulp-ttf2woff2');
const include = require('gulp-include');
const newer = require('gulp-newer');
const replace = require('gulp-replace');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const merge = require('merge-stream');
const htmlmin = require('gulp-htmlmin');

const appPath = 'app';
const distPath = 'dist';

const path = {
  html: appPath + '/**/*.html',

  fonts: appPath + '/fonts',
  fontsFiles: appPath + '/fonts/src/*.ttf',

  images: appPath + '/images',
  imagesSrc: appPath + '/images/src',
  imagesFiles: appPath + '/images/src/**/*.*',

  videos: appPath + '/videos',
  videosFiles: appPath + '/videos/**/*.*',

  js: appPath + '/js',
  jsSrc: appPath + '/js/src/',

  css: appPath + '/css',
  less: appPath + '/less',

  assets: appPath + '/assets',
  assetsFiles: appPath + '/assets/**/*',

  pages: appPath + '/pages',
  pagesHtml: appPath + '/pages/**/*.html',

  components: appPath + '/components',
};

function pages() {
  return src(path.pagesHtml, { base: path.pages })
    .pipe(
      include({
        includePaths: path.components,
      })
    )
    .pipe(replace('../images/', 'images/'))
    .pipe(replace('../videos/', 'videos/'))
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        removeComments: true,
        minifyJS: true,
        minifyCSS: true,
      })
    )
    .pipe(dest('app'))
    .pipe(browserSync.stream());
}

function fonts() {
  return src(path.fontsFiles, { encoding: false })
    .pipe(newer({ dest: path.fonts, ext: '.woff2' }))
    .pipe(ttf2woff2())
    .pipe(dest(path.fonts));
}

function images() {
  const svgGlob = path.imagesSrc + '/**/*.svg';
  const rasterGlob = [path.imagesFiles, '!' + svgGlob];

  // AVIF
  const toAvif = src(rasterGlob, { base: path.imagesSrc, encoding: false })
    .pipe(newer({ dest: appPath + '/images', ext: '.avif' })) // важливо!
    .pipe(avif({ quality: 70, effort: 6 }))
    .pipe(dest(appPath + '/images'));

  // SVG — просто копіюємо або оптимізуємо
  const svgs = src(svgGlob, { base: path.imagesSrc })
    .pipe(newer(appPath + '/images'))
    .pipe(dest(appPath + '/images'));

  return merge(toAvif, svgs);
}

function videos() {
  return src(path.videosFiles, { encoding: false })
    .pipe(newer(path.videos))
    .pipe(dest(path.videos));
}

function scripts() {
  return (
    src([path.jsSrc + '*.js'])
      .pipe(
        plumber({
          errorHandler: function (err) {
            console.error('JS Error:', err.message);
            this.emit('end');
          },
        })
      )
      .pipe(rename({ suffix: '.min' }))
      // .pipe(concat('script.min.js'))
      .pipe(uglify())
      .pipe(dest(path.js))
      .pipe(browserSync.stream())
  );
}

function libsScripts() {
  return src(
    [
      'node_modules/gsap/dist/gsap.min.js',
      'node_modules/gsap/dist/ScrollTrigger.min.js',
      'node_modules/gsap/dist/ScrollToPlugin.min.js',
      'node_modules/@splidejs/splide/dist/js/splide.min.js',
    ],
    { allowEmpty: true }
  )
    .pipe(plumber())
    .pipe(concat('libs.min.js'))
    .pipe(uglify())
    .pipe(dest(path.js));
}

function styles() {
  return src([path.less + '/*.less', '!' + path.less + '/libs.less'])
    .pipe(
      plumber({
        errorHandler: function (err) {
          console.error('LESS Error:', err.message);
          this.emit('end');
        },
      })
    )
    .pipe(less({ compress: true }))
    .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'] }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(path.css))
    .pipe(browserSync.stream());
}

function libsStyles() {
  return src([
    'node_modules/@splidejs/splide/dist/css/splide-core.min.css',
    path.less + '/libs.less',
  ])
    .pipe(plumber())
    .pipe(
      less({
        compress: true,
        paths: ['node_modules'],
      })
    )
    .pipe(concat('libs.min.css'))
    .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'] }))
    .pipe(dest(path.css))
    .pipe(browserSync.stream());
}

function watchLess() {
  watch([path.less + '/**/*.less', '!' + path.less + '/libs.less'], styles);
  watch([path.less + '/libs.less'], libsStyles);
}

function watchApp() {
  watchLess();
  watch([path.jsSrc + '*.js'], scripts);
  watch([path.components + '/**/*', path.pages + '/**/*'], pages);
}

function watching() {
  browserSync.init({
    server: {
      baseDir: appPath + '/',
    },
  });
  watchLess();
  // watch([path.imagesSrc], images);
  watch([path.imagesFiles], images);
  watch([path.videosFiles], videos);
  watch([path.jsSrc], scripts);
  watch([path.components + '/**/*', path.pages + '/**/*'], pages);
  watch([path.html]).on('change', browserSync.reload);
}

function cleanDist() {
  return src(distPath, { read: false, allowEmpty: true }).pipe(clean());
}

function buildingHtml() {
  // HTML files - replace relative paths with root-relative paths
  return src([path.html, '!' + path.pages + '/**/*', '!' + path.components + '/**/*'], {
    base: appPath,
  })
    .pipe(replace('../images/', 'images/'))
    .pipe(replace('../videos/', 'videos/'))
    .pipe(dest(distPath));
}

function buildingAssets() {
  // Other files - copy as-is (CSS files need to keep ../images/ paths)
  // Build asset glob dynamically, only include assets if directory exists
  const assetGlob = [
    path.js + '/*.min.js',
    path.images + '/**/*',
    path.videos + '/**/*',
    path.fonts + '/*.*',
    path.css + '/*.min.css',
    appPath + '/favicon*.png',
    appPath + '/apple-touch-icon.png',
    appPath + '/favicon.ico',
    appPath + '/site.webmanifest',
    '!' + path.imagesSrc + '/**/*',
    '!' + path.imagesSrc,
    '!' + path.images + '/dist/',
  ];

  // Only add assets if the directory exists
  if (fs.existsSync(path.assets)) {
    assetGlob.push(path.assetsFiles);
  }

  // Gulp 5 reads files with utf8 encoding by default, which can corrupt binary assets.
  return src(assetGlob, { base: appPath, allowEmpty: true, encoding: false }).pipe(dest(distPath));
}

exports.fonts = fonts;
exports.pages = pages;
exports.styles = styles;
exports.libsStyles = libsStyles;
exports.images = images;
exports.videos = videos;
exports.scripts = scripts;
exports.libsScripts = libsScripts;
exports.watching = watching;
exports.watchLess = series(parallel(styles, libsStyles), watchLess);
exports.watchApp = series(parallel(styles, libsStyles, scripts, pages), watchApp);
exports.building = parallel(buildingHtml, buildingAssets);

exports.build = series(cleanDist, exports.building);
exports.default = parallel(styles, libsStyles, scripts, libsScripts, pages, videos, watching);
