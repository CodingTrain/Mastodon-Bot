const fs = require('fs');

module.exports = function (M) {
  const listener = M.stream('streaming/user')
  listener.on('error', err => console.log(err))

  listener.on('message', async msg => {
    // fs.writeFileSync(`data${new Date().getTime()}.json`, JSON.stringify(msg, null, 2));
    // console.log('user event');
    // console.log(msg);
    if (msg.event === 'notification') {
      const acct = msg.data.account.acct;
      if (msg.data.type === 'follow') {
        toot(`@${acct} Welcome aboard!`);
      } else if (msg.data.type === 'mention') {

        const regex1 = /(like|favou?rite|❤)/i;
        const content = msg.data.status.content;
        const id = msg.data.status.id;
        // console.log(`mention: ${id} ${content}`);
        if (regex1.test(content)) {
          try {
            const data = await M.post(`statuses/${id}/favourite`)
            console.log(`Favorited ${id} ${data.id}`);
          } catch (error) {
            if (error) console.error(error);
          }
        }
        const regex2 = /(boost|reblog|retweet|🚂)/i;
        if (regex2.test(content)) {
          try {
            const data = await M.post(`statuses/${id}/reblog`)
            console.log(`Reblogged ${id} ${data.id}`);
          } catch (error) {
            console.error(error);
          }
        }

        const regex3 = /\?/i;
        if (regex3.test(content)) {
          console.log('I got a question');
          const num = Math.floor(Math.random() * 100);
          const reply = `@${acct} The meaning of life is: ${num}`;
          toot(reply, id);
        }
      }
    }
  });

  async function toot(content, id) {
    const params = {
      status: content
    }
    if (id) {
      params.in_reply_to_id = id;
    }
    const data = await M.post('statuses', params)
    //fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    //console.log(data);
    console.log(`ID:${data.id}and timestamp:${data.created_at} `);
    console.log(data.content);
  }
}