module.exports = {
  apps: [
    {
      name: "clipScrapper",
      script: "npm",
      args: "run start",
      instances: 1,
      exec_mode: "fork",
      merge_logs: true,
    },
  ],
};
