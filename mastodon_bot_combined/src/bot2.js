import M from "./mastodon";

function toot(content, id) {
  const params = {
    status: content
  }
  if (id) {
    params.in_reply_to_id = id;
  }
  M.post('statuses', params, (error, data) => {
    if (error) {
      console.error(error);
    } else {
      //fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
      //console.log(data);
      console.log(`ID:${data.id}and timestamp:${data.created_at} `);
      console.log(data.content);
    }
  });
}

export default function bot2() {
  const listener = M.stream("streaming/user");
  listener.on("error", err => console.log(err));

  listener.on("message", msg => {
    // fs.writeFileSync(`data${new Date().getTime()}.json`, JSON.stringify(msg, null, 2));
    // console.log('user event');
    // console.log(msg);
    if (msg.event === "notification") {
      const acct = msg.data.account.acct;
      if (msg.data.type === "follow") {
        toot(`@${acct} Welcome aboard!`);
      } else if (msg.data.type === "mention") {
        const regex1 = /(like|favou?rite|❤)/i;
        const content = msg.data.status.content;
        const id = msg.data.status.id;
        // console.log(`mention: ${id} ${content}`);
        if (regex1.test(content)) {
          M.post(`statuses/${id}/favourite`, (error, data) => {
            if (error) console.error(error);
            else console.log(`Favorited ${id} ${data.id}`);
          });
        }
        const regex2 = /(boost|reblog|retweet|🚂)/i;
        if (regex2.test(content)) {
          M.post(`statuses/${id}/reblog`, (error, data) => {
            if (error) console.error(error);
            else console.log(`Reblogged ${id} ${data.id}`);
          });
        }

        const regex3 = /\?/i;
        if (regex3.test(content)) {
          console.log("I got a question");
          const num = Math.floor(Math.random() * 100);
          const reply = `@${acct} The meaning of life is: ${num}`;
          toot(reply, id);
        }
      }
    }
  });
}
