"use strict";

var httpClient = require("http");
var processing = [];
var index = 0;  // Temp
var backoff = 0;
var maxConcurrency = 2;
var tasks = [
    "http://amazing-space.stsci.edu/uploads/resource_image/image/204/hs-2013-51-a-full_jpg.jpg",
    "http://farm8.staticflickr.com/7315/11920653765_8dbd136b17_o.jpg",
    "http://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_1mb.mp4",
    "http://cdn.spacetelescope.org/archives/images/publicationjpg/heic1502a.jpg",
    "http://cdn.spacetelescope.org/archives/images/large/opo0324a.jpg",
    "http://c2.staticflickr.com/8/7151/6760135001_14c59a1490_o.jpg",
    "http://www.nasa.gov/sites/default/files/thumbnails/image/hs-2015-02-a-hires_jpg.jpg",
    "http://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_20mb.mp4",
];

console.log("Long Task Manager");
start();

// make this a class... TODO
function start() {
    scheduleCleanup();
    processTasks();
}

function scheduleCleanup() {
    // every 3600 seconds do a cleanup - check if any orphaned tasks.
}

function processTasks() {
    console.log(" = " + processing.length + " tasks with backoff " + backoff + "ms");

    if (canProcessMoreTasks()) {
        tryNextTask(function(error) {
            // if error, potentially schedule a retry? depends on error. connection? db? job internal?
        });
    } else {
        increaseBackoff();
    }

    scheduleProcessTasks();
}

function canProcessMoreTasks() {
    return (processing.length < maxConcurrency);
}

function tryNextTask(done) {
    var task = getNextTask();

    if (task) {
        processTask(task, function() {
            resetBackoff();
            return done();
        });
    } else {
        // No tasks to be processed.
        increaseBackoff();
        return done();
    }
}

function processTask(task, done) {
    claim(task);    // was it successful? yes, then continue. Else return done. TODO

    console.log(" + Processing (" + task + ")…");
    execute(task, function(error) {
        if (error) {
            console.log(" > Error (" + task + ")!!");
            return done(error);
        } else {
            markTaskComplete(task);
            removeFromProcessing(task);
            console.log(" - Finished (" + task + ")");
            return done();
        }
    });
}

function getNextTask() {
    // Imagine this is the repository or DB layer.
    if (index < tasks.length) {
        var task = tasks[index];
        index += 1;
        return task;
    } else {
        return null;
    }
}

function claim(task) {
    // update the tasks list with a claim id. TODO
    processing.push(task);
}

// Imagine this as the actual task object/class...
// ===============================================
function execute(task, done) {
    var request = httpClient.get(task, function(response) {
        // if response is X, then error... done(error)
        // Blocking...
        return done();
    });
}
// ===============================================
// end

function markTaskComplete(task) {
    // todo
}

function removeFromProcessing(task) {
    var index = processing.indexOf(task);

    if (index > -1) {
        processing.splice(index, 1);
    }
}

function scheduleProcessTasks() {
    if (backoff > 0) {
        setTimeout(processTasks, backoff);
    } else {
        setImmediate(processTasks);
    }
}

function increaseBackoff() {
    // Perhaps just put an upper limit.
    var millisecondRates = [0, 100, 200, 400, 800, 1600, 3200, 6400];
    var index = millisecondRates.indexOf(backoff) + 1;

    if (index < millisecondRates.length) {
        backoff = millisecondRates[index];
    }
}

function resetBackoff() {
    backoff = 0;
}

/**
 * Future public methods
 */
function addTask(type, params) {
    // insert into tasks list
    // - setImediate(start)
}

function getTasksForSearchKey(searchKey) {
    // TODO
}

function getTasksForUserId(userId) {
    // TODO
}
