const browserify = require('browserify');
const gulp = require("gulp");
const source = require('vinyl-source-stream');
const babelify = require('babelify');

function utilityTask(name, entry = "main.js")
{
    gulp.task(`${name}-js`, function() {
        return browserify({sourceType: "module", entries: [
                `utility/${name}/${entry}`
            ]})
            .transform(babelify.configure({presets: ["@babel/env"]}))
            .bundle()
            .pipe(source('app.js'))
            .pipe(gulp.dest(`../html-build/u/${name}`));
    });

    gulp.task(`${name}-assets`, function() {
        return gulp.src([`utility/${name}/*.css`, `utility/${name}/*.php`]).pipe(gulp.dest(`../html-build/u/${name}`));
    });

    gulp.task(`${name}`, gulp.series(`${name}-js`, `${name}-assets`));
};

utilityTask("admin");
utilityTask("hw-planner");
utilityTask("lss-tlt-gen");

gulp.task("utilities", gulp.series("hw-planner"));

gulp.task("lib", function() {
    return gulp.src("lib/*.*").pipe(gulp.dest("../html-build/lib"));
});

gulp.task("assets", function() {
    return gulp.src("*.*").pipe(gulp.dest("../html-build/"));
});

gulp.task("res", function() {
    return gulp.src("res/*.*").pipe(gulp.dest("../html-build/res"));
});

gulp.task("api", function() {
    return gulp.src("api/*.*").pipe(gulp.dest("../html-build/api"));
});

gulp.task("default", gulp.series("assets", "api", "lib", "res", "utilities"));
