var gulp = require('gulp');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var rename = require('gulp-rename');
var connect = require('gulp-connect');
var minifycss = require('gulp-minify-css');
var browserSync = require("browser-sync");

var paths = {
    styles: {
		src: './src/stylesheets/sass',
		files: './src/stylesheets/sass/**/*.scss',
		dest: './src/stylesheets/css'
	},
};

var displayError = function(error) {
    var errorString = '[' + error.plugin + ']';
	errorString += ' ' + error.message.replace("\n",'');
	if(error.fileName)
		errorString += ' in ' + error.fileName;
	if(error.lineNumber)
		errorString += ' on line ' + error.lineNumber;
	console.error(errorString);
};

gulp.task('sass', function (){
	return gulp.src(paths.styles.files)
		.pipe(sass({
			outputStyle: 'expanded',
			sourceComments: 'map',
			includePaths : [paths.styles.src],
			errLogToConsole: true
		}))
		.pipe(prefix('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
		.pipe(gulp.dest(paths.styles.dest))
		.pipe(browserSync.reload({stream:true}));
});

gulp.task('sass-min', function (){
	gulp.src(paths.styles.files)
		.pipe(sass({
			outputStyle: 'compressed',
			sourceComments: 'map',
			includePaths : [paths.styles.src],
			errLogToConsole: true
		}))
		.pipe(prefix('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
		.pipe(rename({suffix: '.min'}))
		.pipe(minifycss())
		.pipe(gulp.dest(paths.styles.dest));
});

gulp.task('html', function () {
	gulp.watch(["./*.html"], function () {
      browserSync.reload();
    });
});

gulp.task('webserver', function() {
    browserSync({
      open: true,
      port: 1338,
      server: {
            baseDir: "./"
      },
      notify: {
        styles: ['opacity: 0', 'position: absolute']
      }
    });
});

gulp.task('default', ['sass','sass-min','html', 'webserver'], function() {
	gulp.watch(paths.styles.files, ['sass', 'sass-min', browserSync.reload])
	.on('change', function(evt) {
		console.log(
			'[watcher] File ' + evt.path.replace(/.*(?=sass)/,'') + ' was ' + evt.type + ', compiling...'
		);
	});
});