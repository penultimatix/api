#!/usr/bin/env node
var express = require('express');
var taskist = require('taskist');
var sugar = require('object-sugar');

var config = require('./config');
var tasks = require('./tasks');
var api = require('./api');


main();

function main() {
    var db = 'db';

    sugar.connect(db, function(err) {
        if(err) {
            return console.error('Failed to connect to database', db, err);
        }

        console.log('Connected to database');

        console.log('Initializing tasks');
        initTasks();

        console.log('Starting server');
        serve();
    });
}

function initTasks() {
    taskist(config.tasks, tasks, {
        instant: true
    });
}

function serve() {
    var app = express();
    var port = config.port;

    app.configure(function() {
        app.set('port', port);

        app.disable('etag');

        app.use(express.logger('dev'));

        app.use(app.router);
    });

    app.configure('development', function() {
        app.use(express.errorHandler());
    });

    api(app);

    process.on('exit', terminator);

    ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS',
    'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGTERM'
    ].forEach(function(element) {
        process.on(element, function() { terminator(element); });
    });

    app.listen(port, function() {
        console.log('%s: Node (version: %s) %s started on %d ...', Date(Date.now() ), process.version, process.argv[1], port);
    });
}

function terminator(sig) {
    if(typeof sig === 'string') {
        console.log('%s: Received %s - terminating Node server ...',
            Date(Date.now()), sig);

        process.exit(1);
    }

    console.log('%s: Node server stopped.', Date(Date.now()) );
}

