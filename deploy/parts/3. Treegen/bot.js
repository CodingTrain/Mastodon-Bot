const util = require('util');
const fs = require('fs');
const exec = util.promisify(require('child_process').exec);

module.exports = function (M) {

  const cmd = 'processing-java --sketch=`pwd`/treegen --run';

  const stream = M.stream('streaming/user');

  stream.on('message', response => {
    if (response.event === 'notification' && response.data.type === 'mention') {
      const id = response.data.status.id;
      const acct = response.data.account.acct;
      const content = response.data.status.content;

      const regex = /\d+/;
      const results = content.match(regex);
      let angle = -1;
      if (results) {
        angle = results[0]
      }

      toot(angle, acct, id)
        .then(response => console.log(response))
        .catch(error => console.error(error));
    }

  });

  // reviveing bot posting a tree every 24h
  // toot()
  //       .then(response => console.log(response))
  //       .catch(error => console.error(error));

  setInterval(() => {
    toot()
        .then(response => console.log(response))
        .catch(error => console.error(error));
  }, 24 * 60 * 60 * 1000);

  async function toot(angle = null, acct, reply_id) {
    if (angle === -1) {
      const params = {
        status: `@${acct} Please specify an angle in degrees using digits`,
        in_reply_to_id: reply_id
      }
      const response = await M.post('statuses', params)
      return {
        success: true,
        angle: -1
      };
    } else {
      if(angle === null) { // I can't do !angle because 0 is falsy in JS
        // random angle between 0 and 180 degrees
        angle = Math.floor(Math.random()*180)
      }
      // Step 1
      const response1 = await exec(cmd + ' ' + angle);
      const out = response1.stdout.split('\n');
      const stream = fs.createReadStream('treegen/tree.png');

      // Step 2: Upload Media
      const params1 = {
        file: stream,
        description: `A randomly generated fractal tree with ${angle}`
      }
      const response2 = await M.post('media', params1);
      const id = response2.data.id;

      // Step 3
      const params2 = {
        status: `Behold my beautiful tree with angle ${angle} degrees`,
        media_ids: [id]
      }
      if(acct && reply_id) {
        params2.status = `@${acct} ${params2.status}`
        params2.in_reply_to_id = reply_id
      }
      const response3 = await M.post('statuses', params2)
      return {
        success: true,
        angle: angle
      };
    }
  }
}