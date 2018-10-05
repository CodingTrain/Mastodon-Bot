import M from "./mastodon";

function toot() {
  const num = Math.floor(Math.random() * 100);
  const params = {
    spoiler_text: "The meaning of life is: ",
    status: num
  }

  M.post('statuses', params, (error, data) => {
    if (error) {
      console.error(error);
    } else {
      //fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
      //console.log(data);
      console.log(`ID: ${data.id} and timestamp: ${data.created_at}`);
      console.log(data.content);
    }
  });
}

export default function bot1() {
    toot();
    setInterval(toot, 24 * 60 * 60 * 1000);
}
