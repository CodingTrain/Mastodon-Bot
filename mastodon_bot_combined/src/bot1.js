const M = require("./mastodon");

async function toot() {
  const num = Math.floor(Math.random() * 100);
  const params = {
    spoiler_text: "The meaning of life is: ",
    status: num
  }

  // M.post('statuses', params, (error, data) => {
  //   if (error) {
  //     console.error(error);
  //   } else {
  //     //fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  //     //console.log(data);
  //     console.log(`ID: ${data.id} and timestamp: ${data.created_at}`);
  //     console.log(data.content);
  //   }
  // });
  const data = await M.post('statuses', params);
  console.log(`ID: ${data.id} and timestamp: ${data.created_at}`);
  console.log(data.content);
}

module.exports = async function bot1() {
  try {
    toot();
    setInterval(toot, 24 * 60 * 60 * 1000);
  } catch (err) {
    console.error(err);
  }
}
