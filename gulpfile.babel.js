const browserify = require('browserify');
const gulp = require("gulp");
const source = require('vinyl-source-stream');
const babelify = require('babelify');

gulp.task("hw-planner-js", function() {
    return browserify({sourceType: "module", entries: ["utility/hw-planner/main.js"]})
        .transform(babelify.configure({presets: ["@babel/env"]}))
        .bundle()
        .pipe(source('app.js'))
        .pipe(gulp.dest("../html-build/u/hw-planner"));
});

gulp.task("hw-planner-assets", function() {
    return gulp.src(["utility/hw-planner/*.css", "utility/hw-planner/*.php"]).pipe(gulp.dest("../html-build/u/hw-planner"));
});

gulp.task("hw-planner", gulp.series("hw-planner-js", "hw-planner-assets"));

gulp.task("lib", function() {
    return gulp.src("lib/*.*").pipe(gulp.dest("../html-build/lib"));
});

gulp.task("default", gulp.series("lib", "hw-planner"));
