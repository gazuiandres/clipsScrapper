const fs = require("node:fs");
const path = require("node:path");
const es = require("event-stream");
const Queue = require("bull");
const Axios = require("axios");

const cleanFolder = require("./utils/cleanFolder");
const createFolder = require("./utils/createFolder");
const folder = path.resolve(__dirname, "clips");

let counter = 0;

const lineQueue = new Queue("line_queue", "redis://127.0.0.1:6379");

lineQueue.clean(0, "delayed");
lineQueue.clean(0, "wait");
lineQueue.clean(0, "paused");
lineQueue.clean(0, "failed");

lineQueue.process(async (job, done) => {
  const { data } = job;

  createFolder(folder, __dirname);

  const response = await Axios({
    method: "GET",
    url: data.data,
    responseType: "stream",
  });

  response.data.pipe(fs.createWriteStream(`${folder}/clip-${Date.now()}-${counter}.mp4`));
  response.data.on("end", () => {
    counter++;
    done();
  });
});

const main = async () => {
  const PATH_FILE = path.join(__dirname, "clips.txt");

  console.info("DOWNLOADING CLIPS");

  cleanFolder(folder, __dirname);

  fs.createReadStream(PATH_FILE, "utf-8")
    .pipe(es.split())
    .on("data", (data) => {
      lineQueue.add({ data: data.toString() });
    })
    .on("end", () => {
      setInterval(async () => {
        const activeJobs = (await lineQueue.getJobs(["active"])).length;
        if (!activeJobs) {
          lineQueue.clean(0, "delayed");
          lineQueue.clean(0, "paused");
          lineQueue.clean(0, "failed");
          lineQueue.clean();
          console.log('CLIPS DOWNLOADED')
          process.exit();
        }
      }, 2000);
    });
};
module.exports = main;
