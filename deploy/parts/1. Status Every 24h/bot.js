const fs = require('fs');

module.exports = function (M) {
  toot();
  setInterval(toot, 24 * 60 * 60 * 1000);

  async function toot() {
    const num = Math.floor(Math.random() * 100);
    const params = {
      spoiler_text: "The meaning of life is: ",
      status: num
    }
    try {
      await M.post('statuses', params)
      //fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
      //console.log(data);
      console.log(`ID: ${data.id} and timestamp: ${data.created_at}`);
      console.log(data.content);
    } catch (error) {
      console.error(error);
    }
  }
}