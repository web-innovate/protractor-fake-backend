# protractor-fake-backend

[![Dependencies Status](https://david-dm.org/web-innovate/protractor-fake-backend.svg)](https://david-dm.org/web-innovate/protractor-fake-backend)
[![Known Vulnerabilities](https://snyk.io/test/npm/protractor-fake-backend/badge.svg)](https://snyk.io/test/npm/protractor-fake-backend)

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
          defaultMocks: ['some/mock', 'another/**'] // default []
        };
      }
    }
```

 - `mocksDir` should receive the relative path of the directory that contains the mock files.
 - `defaultMocks` should receive an array of mock file names that are included every time. you can use [patterns](https://github.com/sindresorhus/globby#globbing-patterns)

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
module.exports = {
  request: {
    path: '/must/start/with/a/slash',
    method: 'POST',
    body: 'request body',
    headers: {
      first: 1,
      second: 'bla'
    },
    queryString: {
      first: '2',
      second: 'woo'
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
