const browserify = require('browserify');
const gulp = require("gulp");
const buffer = require("vinyl-buffer");
const source = require('vinyl-source-stream');
const babelify = require('babelify');
const uglify = require('gulp-uglify');

const OUTPUT_DIR = "../html-build";

var utilityTasks = [];
function utilityTask(name, entry = "main.js")
{
    gulp.task(`utilities/${name}/js`, function() {
        return browserify({entries: [
                `utility/${name}/${entry}`
            ]})
            .transform(babelify.configure({presets: ["@babel/env"]}))
            .bundle()
            .pipe(source('app.js'))
            .pipe(buffer())
            //.pipe(uglify())
            .pipe(gulp.dest(`${OUTPUT_DIR}/u/${name}`));
    });

    gulp.task(`utilities/${name}/assets`, function() {
        return gulp.src([`utility/${name}/*.css`, `utility/${name}/*.php`]).pipe(gulp.dest(`${OUTPUT_DIR}/u/${name}`));
    });

    gulp.task(`utilities/${name}`, gulp.series(`utilities/${name}/js`, `utilities/${name}/assets`));
    utilityTasks.push(`utilities/${name}`);
};

function moduleTask(name, entry = "main.js")
{
    gulp.task(`utilities/${name}/js`, function() {
        return browserify({sourceType: "module", entries: [
                `utility/${name}/${entry}`
            ]})
            .transform(babelify.configure({presets: ["@babel/env"]}))
            .bundle()
            .pipe(source('app.js'))
            .pipe(buffer())
            //.pipe(uglify())
            .pipe(gulp.dest(`${OUTPUT_DIR}/u/${name}`));
    });

    gulp.task(`utilities/${name}/assets`, function() {
        return gulp.src([`utility/${name}/*.css`, `utility/${name}/*.php`]).pipe(gulp.dest(`${OUTPUT_DIR}/u/${name}`));
    });

    gulp.task(`utilities/${name}`, gulp.series(`utilities/${name}/js`, `utilities/${name}/assets`));
    utilityTasks.push(`utilities/${name}`);
};

utilityTask("admin");
moduleTask("hw-planner");
utilityTask("hw-planner");
utilityTask("lss-tlt-gen");
utilityTask("cloud");
utilityTask("support");

utilityTasks.push("utilities/network-builder");

gulp.task("utilities/network-builder", function() {
    return gulp.src("utility/network-builder/**", {base: "utility/network-builder/"}).pipe(gulp.dest(`${OUTPUT_DIR}/u/network-builder`));
});

gulp.task("utilities", gulp.series(utilityTasks));

gulp.task("assets", function() {
    return gulp.src([".htaccess", "*.*"]).pipe(gulp.dest(`${OUTPUT_DIR}/`));
});

gulp.task("api", function() {
    return gulp.src("api/*.*").pipe(gulp.dest(`${OUTPUT_DIR}/api`));
});

gulp.task("lib", function() {
    return gulp.src("lib/*.*").pipe(gulp.dest(`${OUTPUT_DIR}/lib`));
});

gulp.task("res", function() {
    return gulp.src("res/*.*").pipe(gulp.dest(`${OUTPUT_DIR}/res`));
});

gulp.task("res-fonts", function() {
    return gulp.src("res/fonts/*.*").pipe(gulp.dest(`${OUTPUT_DIR}/res/fonts`));
});

gulp.task("misc", function() {
    return gulp.src("utility/misc/*.*").pipe(gulp.dest(`${OUTPUT_DIR}/u/misc`));
});

gulp.task("errors", function() {
    return gulp.src("errors/*.*").pipe(gulp.dest(`${OUTPUT_DIR}/errors`));
});

gulp.task("user", function() {
    return gulp.src("user/*.*").pipe(gulp.dest(`${OUTPUT_DIR}/user`));
});

gulp.task("profile", function() {
    return gulp.src(["profile/.htaccess", "profile/*"]).pipe(gulp.dest(`${OUTPUT_DIR}/profile`));
});

gulp.task("default", gulp.series("assets", "api", "lib", "res", "res-fonts", "misc", "errors", "user", "profile", "utilities"));
