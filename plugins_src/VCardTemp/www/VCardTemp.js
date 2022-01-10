var exec = require('cordova/exec');

exports.coolMethod = function (arg0, success, error) {
    exec(success, error, 'VCardTemp', 'coolMethod', [arg0]);
};

exports.intSDK = function (arg0, success, error) {
  exec(success, error, 'VCardTemp', 'intSDK', [arg0]);
};

exports.scan = function (arg0, success, error) {
  exec(success, error, 'VCardTemp', 'scan', [arg0]);
};
exports.closeConnection = function (arg0, success, error) {
  exec(success, error, 'VCardTemp', 'closeConnection', [arg0]);
};
