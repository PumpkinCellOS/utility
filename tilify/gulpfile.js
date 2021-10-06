"use strict"

const browserify = require('browserify');
const gulp = require("gulp");
const buffer = require("vinyl-buffer");
const source = require('vinyl-source-stream');
const babelify = require('babelify');
const uglify = require('gulp-uglify');
const OUTPUT_DIR = process.env["PCU_BUILD_DIR"];

gulp.task(`tilify`, function() {
    return browserify({entries: ["../tilify/main.js"]})
        .transform(babelify.configure({presets: ["@babel/env"]}))
        .bundle()
        .pipe(source('tilify.js'))
        .pipe(buffer())
        //.pipe(uglify())
        .pipe(gulp.dest(`${OUTPUT_DIR}/tilify`));
});
