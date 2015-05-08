var gulp = require('gulp'),
	gutil = require('gulp-util'),
	sass = require('gulp-sass'),
	prefix = require('gulp-autoprefixer'),
	rename = require('gulp-rename'),
	connect = require('gulp-connect'),
	minifycss = require('gulp-minify-css'),
	browserSync = require("browser-sync"),
	reload = browserSync.reload,
	react = require('gulp-react'),
	cjsx = require('gulp-cjsx'),
	coffee = require('gulp-coffee'),
	sourcemaps = require('gulp-sourcemaps')
	jsonServer = require('json-server');

var paths = {
    styles: {
		src: './src/stylesheets/sass',
		files: './src/stylesheets/sass/**/*.scss',
		dest: './src/stylesheets/css'
	},
	react: {
		src: './src/react',
		jsx_files: './src/react/*.jsx',
		cjsx_files: './src/react/*.cjsx',
		dest: './src/build'
	},
	coffee: {
		files: './src/scripts/app.coffee',
		dest: './src/scripts'
	}
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

function logger(evt) {
	console.log(
		'[watcher] File ' + evt.path.replace(/.*(?=sass)/,'') + ' was ' + evt.type + ', compiling...'
	);
}

gulp.task('static', function() {
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

gulp.task('sass', function (){
	gulp.src(paths.styles.files)
		.pipe(sass({
			outputStyle: 'expanded',
			sourceComments: 'map',
			includePaths : [paths.styles.src],
			errLogToConsole: true
		}))
		.pipe(prefix('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
		.pipe(gulp.dest(paths.styles.dest))
		.pipe(reload({stream: true}));
});

// gulp.task('sass-min', function (){
// 	gulp.src(paths.styles.files)
// 		.pipe(sass({
// 			outputStyle: 'compressed',
// 			sourceComments: 'map',
// 			includePaths : [paths.styles.src],
// 			errLogToConsole: true
// 		}))
// 		.pipe(prefix('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
// 		.pipe(rename({suffix: '.min'}))
// 		.pipe(minifycss())
// 		.pipe(gulp.dest(paths.styles.dest));
// });

gulp.task('html', function() {
	gulp.watch('./index.html', function() {
		reload();
	});
});

gulp.task('coffee', function() {
	gulp.src(paths.coffee.files)
	.pipe(sourcemaps.init())
	.pipe(coffee({bare: true}).on('error', gutil.log))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest(paths.coffee.dest));
});

gulp.task('react', function() {
	gulp.src(paths.react.jsx_files)
	.pipe(react().on('error', gutil.log))
	.pipe(gulp.dest(paths.react.dest));

	gulp.src(paths.react.cjsx_files)
	.pipe(cjsx({bare: true}).on('error', gutil.log))
	.pipe(gulp.dest(paths.react.dest));
});


gulp.task('watcher', function() {

	// gulp.watch(paths.styles.files, ['sass', 'sass-min'])
	// .on('change', logger);

	gulp.watch(paths.styles.files, ['sass'])
	.on('change', logger);

	gulp.watch([paths.react.jsx_files, paths.react.cjsx_files], ['react', reload])
	.on('change', logger);

	gulp.watch(paths.coffee.files, ['coffee']);
});

gulp.task('backend', function () {
	var server = jsonServer.create();
	server.use(jsonServer.defaults);
	server.use(jsonServer.router('backend.json'));
	server.listen(3000);
});

// gulp.task('default', ['sass','sass-min','webserver', 'react', 'watcher']);
gulp.task('default', ['sass', 'react', 'coffee', 'html', 'static', 'backend','watcher']);
