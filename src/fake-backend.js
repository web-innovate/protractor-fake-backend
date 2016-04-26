'use strict';

function moduleTemplate(data) {
  var mocks = data || [];
  var mockModule = angular.module('fakeBackend', []);

  mockModule.requests = [];

  mockModule.config(['$provide', function ($provide) {

    $provide.decorator('$http', ['$delegate', '$q', function ($http, $q) {

      function removeBaseUrl(url) {
        return decodeURIComponent(url).replace(/https?:\/\/[^\/]+/, '');
      }

      function getQueryParams(url) {
        var decodedUrl = decodeURIComponent(url);
        var index = decodedUrl.indexOf('?');

        if (index > -1) {
          return decodedUrl.slice(index + 1, decodedUrl.length).split('&').reduce(function (params, value) {
            var pair = value.split('=');

            if (pair.length === 2) {
              params[pair[0]] = pair[1];
            }
            return params;
          }, {});
        } else {
          return {};
        }
      }

      function stripQueryParams(url) {
        var decodedUrl = decodeURIComponent(url);
        var index = decodedUrl.indexOf('?');

        return index > -1 ? decodedUrl.slice(0, index) : decodedUrl;
      }

      function matchMethod(real, fake) {
        return real.toLowerCase() === fake.toLowerCase();
      }

      function matchUrl(real, fake) {
        return removeBaseUrl(stripQueryParams(real)) === removeBaseUrl(stripQueryParams(fake));
      }

      function equals(a, b) {
        if (a === b) return true;
        if (!(a instanceof Object) || !(b instanceof Object)) return false;
        if (Object.keys(a).length !== Object.keys(b).length) return false;
        for (var prop in a) {
          if (!b.hasOwnProperty(prop)) return false;
          if (a[prop] !== b[prop]) return false;
        }
        return true;
      }

      function match(request) {
        return mocks.filter(function (item) {
          var sameMethod = matchMethod(request.method, item.request.method || 'get');
          var sameUrl = matchUrl(request.url, item.request.path);
          var sameBody = item.request.body ? request.body === item.request.body : true;
          var sameHeaders = item.request.headers ? equals(request.headers, item.request.headers) : true;
          var sameQueryString = equals(getQueryParams(request.url), item.request.queryString || {});
          var sameParams = equals(request.params || {}, item.request.params || {});

          return sameMethod && sameUrl && sameBody && sameHeaders && sameQueryString && sameParams;
        });
      }

      function isStatusSuccessful(status) {
        return status >= 200 && status <= 299;
      }

      function wrapPromise(promise) {
        var newPromise = promise;

        newPromise.success = function (callback) {
          newPromise.then(function (response) {
            callback(response.data, response.status, response.headers, response.config);
          });
          return newPromise;
        };

        newPromise.error = function (callback) {
          newPromise.then(null, function (response) {
            callback(response.data, response.status, response.headers, response.config);
          });
          return newPromise;
        };

        return newPromise;
      }

      function createHeaderGetter(responseHeaders) {
        return function (headerName) {
          if (!headerName) {
            return responseHeaders;
          }

          return responseHeaders[headerName];
        }
      }

      function fakeBackend(request) {
        var promise;

        mockModule.requests.push(request);

        return wrapPromise($q.when(request).then(function (req) {
          var matched = match(req)[0];

          if (matched) {
            var deferred = $q.defer();
            var delay = matched.delay || 0;

            setTimeout(function () {
              matched.response = matched.response || {};

              var response = angular.copy(matched.response);

              response.config = req;

              if (response.headers) {
                response.headers = createHeaderGetter(response.headers);
              } else {
                response.headers = function () {
                };
              }

              $q.when(response).then(function (resolvedResponse) {
                resolvedResponse.status = resolvedResponse.status || 200;

                if (isStatusSuccessful(resolvedResponse.status)) {
                  deferred.resolve(resolvedResponse);
                } else {
                  deferred.reject(resolvedResponse);
                }
              });
            }, delay);

            promise = deferred.promise;
          } else {
            promise = $http(request);
          }

          return promise;
        }));
      }

      ['GET', 'DELETE', 'HEAD', 'JSONP'].forEach(function (method) {
        fakeBackend[method.toLowerCase()] = function (url, request) {
          request = request || {};
          request.url = url;
          request.method = method;

          return fakeBackend(request);
        };
      });

      ['POST', 'PUT', 'PATCH'].forEach(function (method) {
        fakeBackend[method.toLowerCase()] = function (url, data, request) {
          request = request || {};
          request.url = url;
          request.data = data;
          request.method = method;

          return fakeBackend(request);
        };
      });

      fakeBackend.defaults = $http.defaults;

      return fakeBackend;
    }]);
  }]);

  mockModule.clearRequests = function () {
    mockModule.requests = [];
  };

  mockModule.getRequests = function () {
    return mockModule.requests;
  };

  mockModule.getLastRequest = function () {
    var length = mockModule.requests.length;

    return mockModule.requests[length - 1];
  };

  mockModule.addMock = function (mock) {
    if (Array.isArray(mock)) {
      mocks.concat(mock);
    } else if (mock !== null && typeof mock === 'object') {
      mocks.push(mock);
    }
  };

  mockModule.removeMocks = function () {
    mocks = [];
  };

  return mockModule;
}

module.exports = moduleTemplate;
