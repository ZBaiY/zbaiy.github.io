const gulp = require('gulp');
const babel = require('gulp-babel');

// Gulp task to compile JSX files from src/ to build/
gulp.task('build', function() {
  return gulp.src('src/**/*.jsx')
    .pipe(babel())
    .pipe(gulp.dest('build'));
});

// Default task
gulp.task('default', gulp.series('build'));
