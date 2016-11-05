var fakeBackend = require('../src/exported');
var pageObject = require('./page-object');

describe('mock module', function () {
  var page = new pageObject();
  var mock = [
    {
      request: {
        path: '/test',
        method: 'GET'
      },
      response: {
        data: 'get mocked data'
      }
    }, {
      request: {
        path: '/test',
        method: 'POST',
        data: 'test'
      },
      response: {
        data: 'post mocked data'
      }
    }
  ];

  beforeAll(function () {
    fakeBackend(mock);
    browser.get('http://localhost:3005/test/app/');
  });

  it('requests', function () {
    expect(fakeBackend.getRequests()).toEqual([]);

    page.button().click();

    fakeBackend.getRequests().then(function (requests) {
      requests.forEach(function (req, index) {
        expect(req.method).toEqual(mock[index].request.method);
        expect(req.url).toEqual(mock[index].request.path);
      });
    });

    page.reponses().then(function (response) {
      response.forEach(function (res) {
        res.getText().then(function (text) {
          console.log(text);
        });
      });
    });
  });
});
