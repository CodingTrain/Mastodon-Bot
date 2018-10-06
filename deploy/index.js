require('dotenv').config();
const Mastodon = require('mastodon-api');
const { promisify } = require('util')
const fs = require('fs')
const path = require('path');

const readDir = promisify(fs.readdir);
const fileStats = promisify(fs.stat);
const fileExists = promisify(fs.access);

console.log("Mastodon all-in-one Bot starting...");

// Some kind of a cache so multiple parts won't create multiple listeners to the same endpoint.
const MastodonStreams = new Map()
const M = new Mastodon({
  client_key: process.env.CLIENT_KEY,
  client_secret: process.env.CLIENT_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  timeout_ms: 60 * 1000,
  api_url: 'https://botsin.space/api/v1/',
})
// Force Mastodon module to use 'cache'
M.__stream_native = M.stream
M.stream = function (endpoint, ...args) {
  if(!MastodonStreams.has(endpoint)) {
    const stream = M.stream(endpoint, ...args)
    MastodonStreams.set(endpoint, stream)
  }
  return MastodonStreams.get(endpoint)
}

const parts = new Map();

// async iife!
;(async function () {
  const dirName = path.resolve(__dirname, './parts')
  const folders = await readDir(dirName)

  for (const folder of folders) {
    const folderPath = path.join(dirName, folder)
    const isDir = (await fileStats(folderPath)).isDirectory()
    if (isDir) {
      const indexPath = path.join(folderPath, 'bot.js')
      try {
        exists = await fileExists(indexPath, fs.constants.R_OK)
        const part = require(indexPath)
        parts.set(folder, part)
      } catch {
        console.error(`Couldn't find "bot.js" inside part "${folder}" skipping...`)
      }
    }
  }
  console.log(`Running ${parts.size} parts!`)
  parts.forEach(part => part(M))
})()
