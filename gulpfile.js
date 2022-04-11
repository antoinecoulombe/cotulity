var gulp = require('gulp');
var less = require('gulp-less');

var assetsDir = './frontend/src/assets';
var srcDir = `${assetsDir}/less/**/*.less`;
var destDir = `${assetsDir}/css`;

gulp.task('less', function (cb) {
  gulp.src(srcDir).pipe(less()).pipe(gulp.dest(destDir));
  cb();
});

gulp.task(
  'default',
  gulp.series('less', function () {
    gulp.watch(srcDir, gulp.parallel('less'));
  })
);
