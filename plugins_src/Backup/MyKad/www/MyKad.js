var exec = require('cordova/exec');

exports.initMyKad = function (arg0, success, error) {
    exec(success, error, 'MyKad', 'initMyKad', [arg0]);
};

exports.GoogleCalenderInit = function (arg0, success, error) {
    exec(success, error, 'MyKad', 'GoogleCalenderInit', [arg0]);
};

exports.GoogleCalendarGetEvents = function (arg0, success, error) {
    exec(success, error, 'MyKad', 'GoogleCalendarGetEvents', [arg0]);
};
