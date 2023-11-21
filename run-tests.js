const newman = require('newman');

newman.run(
  {
    collection: require('./dpo_test.postman_collection.json'),
    reporters: 'cli',
  },
  function (err) {
    if (err) {
      console.error('Error running collection:', err);
    } else {
      console.log('Collection run completed!');
    }
  }
);
