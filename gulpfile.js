/* Modules */
var 
  gulp = require('gulp'),
  path = require('path'),
  browserSync = require('browser-sync').create(),
  chalk = require('chalk'),
  autoprefixer = require('autoprefixer'),
  clean = require('gulp-clean'),
  concat = require('gulp-concat'),
  cssmin = require('gulp-cssmin'),
  gulpif = require('gulp-if'),
  postcss = require('gulp-postcss'),
  rename = require('gulp-rename'),
  sass = require('gulp-sass'),
  uglify = require('gulp-uglify'),
  nunjucks = require('gulp-nunjucks-render'),
  tap = require('gulp-tap'),
  ts = require('gulp-typescript'),
  chokidar = require('chokidar');
  debug = require('gulp-debug');

//Load Configuration 
var config = require('./build-config.json');

//Setup variables
var buildtasks = ['build:css', 'build:js', 'build:html'];
var staticResourceTasks = [];

//Create global functions
function error() {
  console.log(chalk.bold.red.apply(this, arguments));
  return null;
}

function logging() {
  console.log(chalk.bold.apply(this, arguments));
  console.log(arguments);
  return null;
}

function getConfig() {
  return config;
}

function normalizePath() {
  return path
    .relative(
      process.cwd(),
      path.resolve.apply(this, arguments)
    )
    .replace(/\\/g, "/");
}

function handleError(err) {
  error(err);
  try {
    this.emit('end');
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
}

function logFileChange(event) {
  logging('File ' + event.path ? event.path : event + ' was changed, running tasks...');
}

GulpFunctions = function(){
    this.fn = {};
    this.dependencies = {};
    return this;
};

GulpFunctions.prototype.register = function(name, dependencies, fn){
    this.fn[name] = fn;
    this.dependencies[name] = dependencies;
    //Check if just dependecies setup (no function body)
    if(!(typeof fn === 'function')){
      if(gulp.series) {
        gulp.task(name, gulp.series(dependencies, function(){}));
      } else {
        gulp.task(name, dependencies, function(){});
      }
      
      return;
    }
    if(!(Array.isArray(dependencies))){
      gulp.task(name, fn);
      return;
    }
    //Ducktype for 4.x
    if(gulp.series) {
        //Setup old behaviors
      gulp.task(name, gulp.series(dependencies, fn));
    } else {
      gulp.task(name, dependencies, fn)
    }
};

var gulpFunctions = new GulpFunctions();

// Setup static files
getConfig().static.forEach(function (staticResource) {

  gulpFunctions.register('build:clean:' + staticResource.task, null, function () {
    return gulp.src(normalizePath(staticResource.build + '*'))
      .pipe(clean());
  });


  gulpFunctions.register('build:' + staticResource.task, ['build:clean:' + staticResource.task], function () {
    gulp.src(normalizePath(staticResource.source)).pipe(debug());
    return gulp.src(normalizePath(staticResource.source))
      .on("error", handleError)
      .pipe(debug())
      .pipe(gulp.dest(normalizePath(staticResource.build)))
      .on("error", handleError)
      .pipe(debug());
  });
  buildtasks.push('build:' + staticResource.task);
  staticResourceTasks.push('build:' + staticResource.task);
});

//Build dynamic clean functions
gulpFunctions.register('build:clean:css', null, function () {
  return gulp.src(normalizePath(getConfig().css.build + '*'))
    .pipe(gulpif(getConfig().css.clean, clean()));
});

gulpFunctions.register('build:clean:js', null, function () {
  return gulp.src(normalizePath(getConfig().js.build + '*'))
    .pipe(gulpif(getConfig().js.clean, clean()));
});

gulpFunctions.register('build:clean:html', null, function () {
  return gulp.src(normalizePath(getConfig().html.build + '*' + getConfig().html.extension))
    .pipe(gulpif(getConfig().html.clean, clean()));
});

//Build dynamic functions
gulpFunctions.register('build:css', ['build:clean:css'], function () {
  return gulp.src(normalizePath(getConfig().css.source))
    .on("error", handleError)
    .pipe(gulpif(getConfig().css.cssPreprocessor === 'scss', sass()))
    .on("error", handleError)
    .pipe(postcss([autoprefixer]))
    .pipe(gulpif(getConfig().css.minizine, cssmin()))
    .pipe(rename({
      suffix: getConfig().css.suffix
    }))
    .pipe(gulpif(getConfig().css.concat, concat('site.css')))
    .pipe(gulp.dest(normalizePath(getConfig().css.build)))
    .on("error", handleError);
});

gulpFunctions.register('build:js', (function(){ return ['build:clean:js'].concat(staticResourceTasks)})(), function () {
  return gulp.src(normalizePath(getConfig().js.source))
    .on("error", handleError)
    .pipe(gulpif(getConfig().js.jsPreprocessor === 'ts', ts()))
    .on("error", handleError)
    .pipe(gulpif(getConfig().js.minizine, uglify()))
    .pipe(rename({
      suffix: getConfig().js.suffix
    }))
    .pipe(gulpif(getConfig().js.concat, concat('site.js')))
    .pipe(gulp.dest(normalizePath(getConfig().js.build)))
    .on("error", handleError);
});

gulpFunctions.register('build:html', ['build:clean:html'], function () {

  return gulp.src(normalizePath(getConfig().html.source))
    .on("error", handleError)
    .pipe(gulpif(getConfig().html.templateEngine === 'njk', nunjucks({
      "path": [getConfig().html.templates]
    })))
    .on("error", handleError)
    .pipe(rename({
      suffix: getConfig().html.suffix
    }))
    .pipe(rename({
      extname: getConfig().html.extension
    }))
    .pipe(gulp.dest(normalizePath(getConfig().html.build)))
    .on("error", handleError);
});



gulpFunctions.register('build', buildtasks, function (done) {
  logging("Build done: " + new Date());
  done();
  //return gulp.src(normalizePath(getConfig().browserSync.directory));
});

gulpFunctions.register('serve', null, function (done) {
  if (getConfig().browserSync.enabled) {
    browserSync.init({
      server: {
        baseDir: normalizePath(getConfig().browserSync.directory),
        directory: true
      }
    });
  }
  done();
});

gulpFunctions.register('serve:reload', function reload(done) {
  browserSync.reload();
  done();
});

buildtasks.forEach(function (taskName) {
  gulpFunctions.register('serve:reload:' + taskName, [taskName], function reload(done) {
    browserSync.reload();
    done();
  })
});

gulpFunctions.register('watch:build', 
// ['build'], 
// // null,

function (done) {
  console.log("----------");
  // console.log([normalizePath(getConfig().css.source)]);
  // console.log(gulp.watch(['**/*.*']).getWatched());
  
  
   
  if(gulp.series){
    chokidar.watch([normalizePath(getConfig().css.source)]).on('all', (event, path) => {
      //console.log(event, path);
      if(event === 'add'){
        console.log("Added "+path+" to watch.");
      }
      if(event === 'change'){
        gulp.task("serve:reload:build:css")();
      }
    });
    chokidar.watch([normalizePath(getConfig().js.source)]).on('all', (event, path) => {
      //console.log(event, path);
      if(event === 'add'){
        console.log("Added "+path+" to watch.");
      }
      if(event === 'change'){
        gulp.task("serve:reload:build:js")();
      }
    });
    chokidar.watch([normalizePath(getConfig().html.source)]).on('all', (event, path) => {
      //console.log(event, path);
      if(event === 'add'){
        console.log("Added "+path+" to watch.");
      }
      if(event === 'change'){
        gulp.task("serve:reload:build:html")();
      }
    });
    if (getConfig().html.templateEngine != false && getConfig().html.templates != '') {
      chokidar.watch([normalizePath(getConfig().html.templates + '/**/*.*')]).on('all', (event, path) => {
        //console.log(event, path);
        if(event === 'add'){
          console.log("Added "+path+" to watch.");
        }
        if(event === 'change'){
          gulp.task("serve:reload:build:html")();
        }
      });
    }
    getConfig().static.forEach(function (staticResource) {
      //console.log(staticResource);
      chokidar.watch([normalizePath(staticResource.source)]).on('all', (event, path) => {
        //console.log(event, path);
        if(event === 'add'){
          console.log("Added "+path+" to watch.");
        }
        if(event === 'change'){
          gulp.task('serve:reload:build:' + staticResource.task)();
        }
      });
      gulp.watch(normalizePath(staticResource.source), gulp.series('serve:reload:build:' + staticResource.task)).on('change', logFileChange);
    });
  } else {
    gulp.watch(normalizePath(getConfig().css.source), ['serve:reload:build:css']).on('change', logFileChange);
    gulp.watch(normalizePath(getConfig().js.source), ['serve:reload:build:js']).on('change', logFileChange);
    gulp.watch(normalizePath(getConfig().html.source), ['serve:reload:build:html']).on('change', logFileChange);
    if (getConfig().html.templateEngine != false && getConfig().html.templates != '') {
      gulp.watch(normalizePath(getConfig().html.templates + '/**/*.*'), ['serve:reload:build:html']).on('change', logFileChange);
    }

    getConfig().static.forEach(function (staticResource) {
      gulp.watch(normalizePath(staticResource.source), ['serve:reload:build:' + staticResource.task]).on('change', logFileChange);
    });
  }
  // done();
});

gulpFunctions.register('watch:serve', ['build', 'serve', 'watch:build']);