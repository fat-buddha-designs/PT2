const humans = require('humans-generator');

module.exports = {
  data: function () {
    return {
      permalink: 'humans.txt',
      sitemap: {
        ignore: true
      },
      robots: {
        ignore: true
      }
    }
  },
  render: async function (data) {
    return await new Promise((resolve, reject) => {
      humans(data.other.humans, (error, humans) => {
        if (error) {
          reject(error);
        } else {
          resolve(humans.join('\n'));
        }
      })
    });
  }
}
