// Project Variables
var projectURL            = './'; // Folder URL, keep as './' if working from root folder

// SCSS
var styleSRC              = './src/styles/style.scss'; // Path to source SCSS file.
var styleDestination      = './assets/css/'; // Path to save the compiled CSS file.

// JS (with source JS files in specified concat order)
var scriptSRC             = [
                              './src/scripts/classie.js', // Class toggling
                              './src/scripts/list.js', // Search, sort, and filter to tables/lists
                              './src/scripts/main.js' // Main JS file.
                            ];
var scriptDestination     = './assets/js/'; // Path to save the compiled JS file.
var scriptFile            = 'scripts'; // Compiled JS file name.

// Watch file paths
var styleWatchFiles        = './src/styles/**/*.scss'; // Path to all SCSS files
var scriptJSWatchFiles     = './src/scripts/**/*.js'; // Path to all JS files.
var projectHTMLWatchFiles  = './**/*.html'; // Path to all HTML files

// Browsers for autoprefixing
const AUTOPREFIXER_BROWSERS = [
    'last 2 versions', '> 1%', 
    'ie >= 9', 
    'ie_mob >= 10', 
    'ff >= 30', 
    'chrome >= 34', 
    'safari >= 7', 
    'opera >= 23', 
    'ios >= 7', 
    'android >= 4', 
    'bb >= 10'
];

// Load gulp plugins and assign semantic names
var gulp         = require('gulp'); // Gulp

// CSS plugins
var sass         = require('gulp-sass'); // Gulp pluign for Sass compilation.
var minifycss    = require('gulp-uglifycss'); // Minifies CSS files.
var autoprefixer = require('gulp-autoprefixer'); // Autoprefixing magic.
var mmq          = require('gulp-merge-media-queries'); // Combine matching media queries into one media query definition.

// JS plugins
var jshint       = require('gulp-jshint'); // Checks JS for errors
var concat       = require('gulp-concat'); // Concatenates JS files
var uglify       = require('gulp-uglify'); // Minifies JS files

// Utility plugins
var rename       = require('gulp-rename'); // Renames files E.g. style.css -> style.min.css
var lineec       = require('gulp-line-ending-corrector'); // Consistent Line Endings for non UNIX systems.
var filter       = require('gulp-filter'); // Enables you to work on a subset of the original files by filtering them using globbing.
var sourcemaps   = require('gulp-sourcemaps'); // Maps code in a compressed file
var browserSync  = require('browser-sync').create(); // Reloads browser and injects CSS. Time-saving synchronised browser testing.
var reload       = browserSync.reload; // For manual browser reload.

// STYLE TASK
// Compile SCSS, add vendor prefixes, minify, save to CSS folder
gulp.task('styles', function (done) {
  gulp.src( styleSRC )
  .pipe( sourcemaps.init() )
  .pipe( sass( {
    errLogToConsole: true,
      // outputStyle: 'compact',
      outputStyle: 'compressed',
      // outputStyle: 'nested',
      // outputStyle: 'expanded',
      precision: 10
    } ) )
  .on('error', console.error.bind(console))
  .pipe( sourcemaps.write( { includeContent: false } ) )
  .pipe( sourcemaps.init( { loadMaps: true } ) )
  .pipe( autoprefixer( AUTOPREFIXER_BROWSERS ) )
  .pipe( sourcemaps.write ( './' ) ) // Write sourcemap to same folder
  .pipe( lineec() ) // Consistent Line Endings for non UNIX systems
  .pipe( gulp.dest( styleDestination ) )
  .pipe( filter( '**/*.css' ) ) // Filtering stream to only css files
  .pipe( mmq( { log: true } ) ) // Merge Media Queries only for .min.css version
  .pipe( browserSync.stream() ) // Reloads style.css if that is enqueued
  .pipe( rename( { suffix: '.min' } ) )
  .pipe( minifycss( { maxLineLen: 10 }))
  .pipe( lineec() ) // Consistent Line Endings for non UNIX systems
  .pipe( gulp.dest( styleDestination ) )
  .pipe( filter( '**/*.css' ) ) // Filtering stream to only css files
  .pipe( browserSync.stream() ) // Reloads style.min.css if that is enqueued
  done();
});

// SCRIPTS TASK
// Get JS source files, error check, concat, rename, minify, save to JS folder
gulp.task( 'scripts', function(done) {
  gulp.src( scriptSRC )
  .pipe(jshint())
  .pipe(jshint.reporter('jshint-stylish'))
  .pipe( concat( scriptFile + '.js' ) )
  .pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
  .pipe( gulp.dest( scriptDestination ) )
  .pipe( rename( { basename: scriptFile, suffix: '.min' }))
  .pipe( uglify() )
  .pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
  .pipe( gulp.dest( scriptDestination ) )
  done();
});








// Wait for jekyll-build, then launch the Server
gulp.task('browser-sync', gulp.series("styles", "scripts", function(done) {
  browserSync.init({
    server: {
      baseDir: projectURL
    },
    notify: {
      styles: {
        top: "auto",
        bottom: "0",
        borderBottomLeftRadius: "0",
      }
    },
    port: 3000
  });
  done();
}));




// Reload helper function
function reload(done) {
  browserSync.reload();
  done();
}

// Watch files
function watch(done) {
  gulp.watch(styleWatchFiles, gulp.series("styles", reload));
  gulp.watch(scriptJSWatchFiles, gulp.series("scripts", reload));
  gulp.watch(projectHTMLWatchFiles, reload);
  done();
}

// Default task
gulp.task("default", gulp.series("browser-sync", watch));


