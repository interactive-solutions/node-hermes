var gulp  = require('gulp');
var shell = require('gulp-shell');
var tsc   = require('gulp-tsc');

var paths = {
    tscripts : {
        src : [
            'src/**/*.ts',
            'test/**/*.ts',
            'typings/main.d.ts'
        ],
        dest : 'dist'
    }
};

gulp.task('default', ['compile:typescript']);

gulp.task('test', ['compile:typescript'], shell.task([
    'node_modules/mocha/bin/mocha'
]));

gulp.task('test:teamcity',  ['compile:typescript'], shell.task([
    'node_modules/mocha/bin/mocha --reporter mocha-teamcity-reporter test'
]));

gulp.task('watch', function () {
  gulp.watch(paths.tscripts.src, ['compile:typescript']);
});

gulp.task('compile:typescript', function () {
  return gulp
      .src(paths.tscripts.src)
      .pipe(tsc({
        emitError: false,
        target: 'ES5',
        sourceMap:true
      }))
      .pipe(gulp.dest(paths.tscripts.dest));
});
