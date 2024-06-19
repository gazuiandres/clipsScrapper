const getClipsLink = require('./getClipsLinks')
const downloadClips = require('./downloadClips')
const cron = require("node-cron");

const main = async () => {
    console.log('STARTING SCRAPPER')
    await getClipsLink()
    await downloadClips()
}

cron.schedule("0 6 * * *", () => main(), {
  timezone: "America/Mexico_City",
});

console.log('CRON ACTIVE')
