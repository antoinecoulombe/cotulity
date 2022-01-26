var gulp = require('gulp');
var less = require('gulp-less');

var assetsDir = './frontend/src/assets';
var srcDir = `${assetsDir}/less`;
var destDir = `${assetsDir}/css`;

gulp.task(
  'compile-less',
  gulp.series(function () {
    gulp.src(`${srcDir}/**/*.less`).pipe(less()).pipe(gulp.dest(destDir));
  })
);
gulp.task(
  'watch-less',
  gulp.series(function () {
    gulp.watch(`${srcDir}/**/*.less`, gulp.series('compile-less'));
  })
);

gulp.task('default', gulp.series('watch-less'));
