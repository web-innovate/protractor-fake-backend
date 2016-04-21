'use strict';

var globby = require('globby');
var path = require('path');
var fakeBackend = require('./fake-backend');
var defaultConfig = require('./default-config');

function getConfig() {
  var config = Object.assign({}, defaultConfig);
  var userConfig = module.exports.config;

  if (userConfig) {
    for (var prop in userConfig) {
      if (config.hasOwnProperty(prop)) {
        config[prop] = userConfig[prop];
      }
    }
  }

  return config;
}

function getMocks(mockFiles, excludeDefaultMocks) {
  var config = getConfig();
  var files = mockFiles || [];
  var excludeDefault = excludeDefaultMocks || false;
  var globOptions = {
    nodir: true,
    cwd: path.join(process.cwd(), config.mocksDir)
  };

  if (typeof files === 'string' || files instanceof String) {
    files = [files];
  }

  if (!excludeDefault) {
    if (Array.isArray(config.defaultMocks)) {
      files = files.concat(config.defaultMocks);
    } else if (typeof config.defaultMocks === 'string' || config.defaultMocks instanceof String) {
      files.push(config.defaultMocks);
    }
  }

  return (globby.sync(files, globOptions))
    .map(function (mock) {
      return require(path.join(process.cwd(), config.mocksDir, mock));
    })
    .reduce(function (collection, data) {
      return collection[Array.isArray(data) ? 'concat' : 'push'](data);
    }, []);
}

module.exports = function (mockFiles, excludeDefaultMocks) {
  var mocks = getMocks(mockFiles, excludeDefaultMocks);

  browser.addMockModule('fakeBackend', fakeBackend, mocks);
};

module.exports.teardown = function () {
  browser.clearMockModules();
};

module.exports.getRequests = function () {
  return browser.executeAsyncScript(function () {
    var fakeBackend = angular.module("fakeBackend");
    var callback = arguments[arguments.length - 1];

    callback(fakeBackend.getRequests);
  });
};

module.exports.clearRequests = function () {
  return browser.executeAsyncScript(function () {
    var fakeBackend = angular.module("fakeBackend");
    var callback = arguments[arguments.length - 1];

    fakeBackend.clearRequests();
    callback(true);
  });
};

module.exports.addMock = function (mock) {
  return browser.executeAsyncScript(function () {
    var fakeBackend = angular.module("fakeBackend");
    var callback = arguments[arguments.length - 1];

    fakeBackend.addMock(arguments[0]);
    callback(true);
  }, mock);
};

module.exports.removeMocks = function () {
  return browser.executeAsyncScript(function () {
    var fakeBackend = angular.module("fakeBackend");
    var callback = arguments[arguments.length - 1];

    fakeBackend.removeMocks();
    callback(true);
  });
};
