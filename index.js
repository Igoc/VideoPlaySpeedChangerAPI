/* REQUIRE PACKAGES */

const cors    = require('cors');
const express = require('express');
const helmet  = require('helmet');
const morgan  = require('morgan');

/* DECLARE CONSTANT */

const PORT = 5000;

/* SET MORGAN TOKEN */

morgan.token('date', function () {
    return new Date().toLocaleString();
});

/* DECLARE EXPRESS APP */

const app = express();

/* SET EXPRESS MODULES */

app.use(cors());
app.use(helmet());
app.use(morgan('[:date] :remote-addr - :method :url HTTP/:http-version :status - :response-time ms'));

/* REQUIRE EXPRESS ROUTERS */

const download = require('./router/download.js');
const upload   = require('./router/upload.js');

/* SET EXPRESS ROUTERS */

app.use('/download', download);
app.use('/upload', upload);

/* SET EXPRESS ERROR MIDDLEWARE */

app.use(function (error, request, response, next) {
    response.status(error.status).end();
});

/* RUN EXPRESS APP */

app.listen(PORT, '0.0.0.0');