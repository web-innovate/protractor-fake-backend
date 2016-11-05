'use strict';

/* global angular, browser */

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

function isType(value, type) {
  return value.constructor.toString().indexOf(type) > -1;
}

function getMocks(mockFiles, excludeDefaultMocks) {
  var config = getConfig();
  var allMocks = [];
  var files = [];
  var excludeDefault = excludeDefaultMocks || false;
  var globOptions = {
        nodir: true,
        cwd: path.join(process.cwd(), config.mocksDir)
      };

  function separateMockTypes(array) {
    array.forEach(function (item) {
      if (isType(item, 'Object')) {
        allMocks.push(item);
      } else if (isType(item, 'String')) {
        files.push(item);
      }
    });
  }

  if (Array.isArray(mockFiles)) {
    separateMockTypes(mockFiles);
  } else if (isType(mockFiles, 'String')) {
    files.push(mockFiles);
  }

  if (!excludeDefault) {
    if (Array.isArray(config.defaultMocks)) {
      separateMockTypes(config.defaultMocks);
    }
  }

  return (globby.sync(files, globOptions))
    .map(function (mock) {
      return require(path.join(process.cwd(), config.mocksDir, mock));
    })
    .reduce(function (collection, data) {
      return collection.concat(Array.isArray(data) ? data : [data]);
    }, allMocks);
}

module.exports = function (mockFiles, excludeDefaultMocks) {
  var mocks = getMocks(mockFiles, excludeDefaultMocks);

  browser.addMockModule('fakeBackend', fakeBackend, mocks);
};

module.exports.teardown = function () {
  browser.removeMockModule('fakeBackend');
};

module.exports.getRequests = function () {
  return browser.executeAsyncScript(function () {
    var fakeBackend = angular.module('fakeBackend');
    var callback = arguments[arguments.length - 1];

    callback(fakeBackend.getRequests());
  });
};

module.exports.getLastRequest = function () {
  return browser.executeAsyncScript(function () {
    var fakeBackend = angular.module('fakeBackend');
    var callback = arguments[arguments.length - 1];

    callback(fakeBackend.getLastRequest());
  });
};

module.exports.clearRequests = function () {
  return browser.executeAsyncScript(function () {
    var fakeBackend = angular.module('fakeBackend');
    var callback = arguments[arguments.length - 1];

    fakeBackend.clearRequests();
    callback(true);
  });
};

module.exports.addMock = function (mock) {
  return browser.executeAsyncScript(function () {
    var fakeBackend = angular.module('fakeBackend');
    var callback = arguments[arguments.length - 1];

    fakeBackend.addMock(arguments[0]);
    callback(true);
  }, mock);
};

module.exports.removeMocks = function () {
  return browser.executeAsyncScript(function () {
    var fakeBackend = angular.module('fakeBackend');
    var callback = arguments[arguments.length - 1];

    fakeBackend.removeMocks();
    callback(true);
  });
};
