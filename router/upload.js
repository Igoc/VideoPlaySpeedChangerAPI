/* REQUIRE PACKAGES */

const execSync   = require('child_process').execSync;
const express    = require('express');
const ffmpeg     = require('@ffmpeg-installer/ffmpeg');
const ffprobe    = require('@ffprobe-installer/ffprobe');
const fileSystem = require('fs');
const multer     = require('multer');
const path       = require('path');
const sha256     = require('crypto-js/sha256');

/* DECLARE CONSTANT */

const FFMPEG_PATH  = ffmpeg.path;
const FFPROBE_PATH = ffprobe.path;

const FILE_DIRECTORY   = 'files/';
const VIDEO_EXTENSION  = '.mp4';
const DOWNLOAD_TIMEOUT = 1800000;

/* DECLARE GLOBAL VARIABLE */

let fileName = '';

/* DECLARE MULTER DISK STORAGE */

const storage = multer.diskStorage({
    destination: FILE_DIRECTORY,
    filename: function (request, file, callback) {
        const date = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString().replace(/:/gi, '-') + '-' + new Date().getMilliseconds();

        const originalFileName = '[' + date + ' ' + time + '] ' + file.originalname;
        const hashedFileName   = sha256(originalFileName.split('.')[0]).toString() + path.extname(file.originalname);

        fileName = hashedFileName;

        callback(null, hashedFileName);
    }
});

/* DECLARE MULTER UPLOADER */

const uploader = multer({
    storage: storage
});

/* EXPORT EXPRESS ROUTER */

module.exports = express.Router().post('/', uploader.single('file'), function (request, response) {
    const outputFileName = sha256(fileName.split('.')[0]).toString() + VIDEO_EXTENSION;
    const speed          = parseFloat(request.body.speed);

    const ffprobeArguments = ' -v error -select_streams a:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "' + FILE_DIRECTORY + fileName + '"';

    if (execSync(FFPROBE_PATH + ffprobeArguments).toString().trim() == 'unknown') {
        const ffmpegArguments = ' -i "' + FILE_DIRECTORY + fileName + '" -filter_complex "[0:v]setpts=' + (1.0 / speed) + ' * PTS[v]" -map "[v]" -y ' + FILE_DIRECTORY + outputFileName;

        execSync(FFMPEG_PATH + ffmpegArguments, { stdio: 'pipe' });
    }
    else {
        const ffmpegArguments = ' -i "' + FILE_DIRECTORY + fileName + '" -filter_complex "[0:v]setpts=' + (1.0 / speed) + ' * PTS[v]; [0:a]atempo=' + speed +'[a]" -map "[v]" -map "[a]" -y ' + FILE_DIRECTORY + outputFileName;

        execSync(FFMPEG_PATH + ffmpegArguments, { stdio: 'pipe' });
    }

    fileSystem.unlinkSync(FILE_DIRECTORY + fileName);

    setTimeout(function () {
        fileSystem.stat(FILE_DIRECTORY + outputFileName, function (error) {
            if (error == null) {
                fileSystem.unlinkSync(FILE_DIRECTORY + outputFileName);
            }
        });
    }, DOWNLOAD_TIMEOUT);

    response.send(outputFileName);
});