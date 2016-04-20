# protractor-fake-backend

A NodeJS module to be used alongside [protractor](https://github.com/angular/protractor)

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
          mocksDir: 'relative/path/to/mocks/directory', // default 'mocks'
          defaultMocks: ['some/mock', 'another'] // default []
        };
      }
    }
```

## Mock files

Mock files must be written in javascript and must export and array or an object

```javascript
    module.exports = {
      request: {
        method: 'GET',
        status: 200,
        params: {
          first: 1,
          second: 'bla'
        },
        queryString: {
          first: 2,
          second: 'woo'
        }
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
