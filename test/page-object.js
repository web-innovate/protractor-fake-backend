var page = function () {
  this.button = function () {
    return element(by.css('.boo'));
  };

  this.reponses = function () {
    return element.all(by.css('.response > li'));
  };
};

module.exports = page;
