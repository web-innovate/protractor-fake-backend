angular
  .module('demo', [])
  .run(function ($rootScope, $http) {

    var requests = [
      { path: '/test', method: 'get' },
      { path: '/test', method: 'post', data: 'test' }
    ];

    $rootScope.responses = [];

    $rootScope.testCall = function () {
      requests.forEach(function (request, index) {
        console.log(request);
        $http[request.method](request.path, request.data)
          .then(function (response) {
            $rootScope.responses[index] = response;
          });
      });
    };
  });
