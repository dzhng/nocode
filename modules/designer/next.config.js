const withTM = require('next-transpile-modules')(['nocode-shared']); // pass the modules you would like to see transpiled

module.exports = withTM({
  images: {
    domains: ['firebasestorage.googleapis.com', 'v2.convertapi.com'],
  },
});
