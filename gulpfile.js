var gulp  = require('gulp');
var shell = require('gulp-shell');
var tsc   = require('gulp-tsc');

var paths = {
    tscripts : {
        src : [
            'src/**/*.ts',
            'typings/main.d.ts'
        ],
        dest : 'dist'
    }
};

gulp.task('default', ['run']);

gulp.task('ts:run', shell.task([
    'ts-node src/example.ts'
]));

gulp.task('run', ['compile:typescript'], shell.task([
    'node dist/example.js'
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
