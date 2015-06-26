var gulp	 		= require('gulp'),
		webpack		= require('gulp-webpack'),
		path			= require('path'),
		sync			= require('run-sequence'),
		serve			= require('browser-sync'),
		rename		= require('gulp-rename'),
		template	= require('gulp-template'),
		fs				= require('fs'),
		lodash 		= require('lodash'),
		reload		= function () { return serve.reload() },
		nodemon 	= require('gulp-nodemon');

var resolveToApp = function(glob){
	glob = glob || '';
	return path.join(root, 'app', glob); // app/{glob}
};

var resolveToComponents = function(glob){
	glob = glob || '';
	return path.join(root, 'app/components', glob); // app/components/{glob}
};

var root = 'client';

// map of all our paths
var paths = {
	js: 'client/app/**/*', // don't include spec files
	less: resolveToApp('**/*.less'), // our stylus files
	html: [
		resolveToApp('**/*.html'),
		path.join(root, 'index.html')
	],
	server: __dirname + '/server/app.js',

	entry: path.join(root, 'app/app.js'),
	output: __dirname + '/client/static',
	serve: __dirname + '/client/static',
	blankTemplates: path.join(__dirname, 'generator', 'component/**/*.**')
};

// use our webpack.config.js to
// build our modules
gulp.task('webpack', function(){
	return gulp.src(paths.entry)
		.pipe(webpack(require('./webpack.config')(true)))
		.pipe(gulp.dest(paths.output));
});

gulp.task('serve', function(){
	serve({
		port: process.env.FRONTEND_PORT || 8080,
		open: false,
		server: {
			baseDir: paths.serve
		}
	});
});

gulp.task('server', function () {
	nodemon({
    script: paths.server,
		watch: __dirname + '/server',
		ext: 'js coffee',
		env: { 'NODE_ENV': 'development' }
  });
});

gulp.task('watch', function(){
	var allPaths = [].concat(
		[paths.js],
		paths.html,
		[paths.less]
	);

	gulp.watch(allPaths, ['webpack', reload]);
});


gulp.task('default', function(done){
	sync('webpack', 'server', 'watch', done);
});
