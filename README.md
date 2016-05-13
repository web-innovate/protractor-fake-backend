# protractor-fake-backend

[![Build Status](https://travis-ci.org/web-innovate/protractor-fake-backend.svg?branch=master)](https://travis-ci.org/web-innovate/protractor-fake-backend)
[![Dependency Status](https://david-dm.org/web-innovate/protractor-fake-backend.svg)](https://david-dm.org/web-innovate/protractor-fake-backend)
[![devDependency Status](https://david-dm.org/web-innovate/protractor-fake-backend/dev-status.svg)](https://david-dm.org/web-innovate/protractor-fake-backend#info=devDependencies)
[![Known Vulnerabilities](https://snyk.io/test/npm/protractor-fake-backend/badge.svg)](https://snyk.io/test/npm/protractor-fake-backend)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/8198279383664f79be0c4eed4ce03db0)](https://www.codacy.com/app/andrei-scripcaru/protractor-fake-backend?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=web-innovate/protractor-fake-backend&amp;utm_campaign=Badge_Grade)

A NodeJS module to be used alongside [Protractor](https://github.com/angular/protractor)

## Installation

    npm install --save-dev protractor-fake-backend

## Configuration

In your protractor configuration file you need to do the following:

```javascript
    exports.config = {
      // other stuff
      onPrepare: function() {
        // other stuff
        require('protractor-fake-backend').config = {
          mocksDir: 'path/to/mocks/directory', // default 'mocks'
          defaultMocks: ['some/mock', 'another/**', {request:{}, response:{}}] // default []
        };
      }
    }
```

 - `mocksDir` should receive the relative path of the directory that contains the mock files.
 - `defaultMocks` must be an array. The array can contain [mock objects](#reference-mock) and file names (strings). These are included every time (unless `excludeDefaultMocks = true`). You can use [patterns](https://github.com/sindresorhus/globby#globbing-patterns) for file names

## Mock files

Mock files must be written in javascript and must export a mock object or an array of mock objects

```javascript
    module.exports = {
      request: {
        path: '/the/path',
        method: 'GET'
      },
      response: {
        data: 'bla'
      }
    }
```
or
```javascript
    module.exports = [
      {
        // first mock
      }, {
        // second mock
      }
    ]
```

### Reference mock object

```javascript
{
  request: {
    path: '/must/start/with/a/slash',
    method: 'POST',
    data: 'request body',
    headers: {
      first: 1,
      second: 'bla'
    },
    params: {
      first: 1,
      second: 'woo'
    }
  },
  response: {
    status: 200,
    data: 'bla',
    headers: {
      first: 1,
      second: 'two'
    }
  }
}
```

## Usage

```javascript
var fakeBackend = require('protractor-fake-backend');
var page = require('your/page/object');

describe('your test', function() {
  beforeAll(function() {
    fakeBackend(['first/file', 'second/file']);
    page.get();
  });

  it('check the last request', function() {
    var expectation = {
          path: '/the/path',
          method: 'POST',
          body: 'request body'
        };

    fakeBackend.clearRequests();

    page.someButton.click();

    fakeBackend.getLastRequest().then(function(request) {
      expect(request).toEqual(expectation);
    });
  });
});
```

## API

#### `fakeBackend(mocks, excludeDefaultMocks)`
Adds the mock module on protractor. Needs to be called in each spec.

`mocks` if not passed, only default mocks will be included.

Can be:

- A string representing a file name or a pattern. E.g. `'some/file'` or `'file/**'`
- An array that can contain a combination of file names(or patterns) and [mock objects](#reference-mock-object)

`excludeDefaultMocks` by default is `false`. As the name says, if you pass `true` then the default mocks declared in [config](#configuration) won't be added

#### `fakeBackend.teardown()`
Removes the mock module from protractor

#### `fakeBackend.getRequests()`
Returns an array containing all intercepted requests

#### `fakeBackend.getLastRequest()`
Returns the last intercepted request

#### `fakeBackend.clearRequests()`
Deletes all the intercepted requests

#### `fakeBackend.addMock(mock)`
Adds one or more mocks. The `mock` param can be an [Object](#reference-mock-object) or an Array of [Objects](#reference-mock-object)

#### `fakeBackend.removeMocks()`
Removes all the mocks from the module
