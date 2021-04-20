/* REQUIRE PACKAGES */

const express    = require('express');
const fileSystem = require('fs');
const httpErrors = require('http-errors');

/* DECLARE CONSTANT */

const FILE_DIRECTORY = 'files/';

/* EXPORT EXPRESS ROUTER */

module.exports = express.Router().get('/', function (request, response, next) {
    fileSystem.stat(FILE_DIRECTORY + request.query.file, function (error) {
        if (error != null) {
            console.error('[' + new Date().toLocaleString() + '] ' + request.connection.remoteAddress + ' - ' + request.method + ' /download :: ' + error);

            return next(new httpErrors.BadRequest());
        }

        return response.download(FILE_DIRECTORY + request.query.file, request.query.file, function (error) {
            if (error != null) {
                console.error('[' + new Date().toLocaleString() + '] ' + request.connection.remoteAddress + ' - ' + request.method + ' /download :: ' + error);

                return next(new httpErrors.InternalServerError());
            }

            fileSystem.unlinkSync(FILE_DIRECTORY + request.query.file);
        });
    });
});