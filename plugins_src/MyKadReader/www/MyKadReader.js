var exec = require('cordova/exec');

exports.coolMethod = function (arg0, success, error) {
    exec(success, error, 'MyKadReader', 'coolMethod', [arg0]);
};


exports.initMyKad = function (arg0, success, error) {
  exec(success, error, 'MyKadReader', 'initMyKad', [arg0]);
};

