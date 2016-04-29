exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['test/**.spec.js'],
  capabilities: {
    browserName: 'firefox'
  }
};
