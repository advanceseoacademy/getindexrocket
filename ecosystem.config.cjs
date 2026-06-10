/** PM2 — production: next start (migrations run separately in deploy script) */
module.exports = {
  apps: [
    {
      name: "getindexrocket",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start -p " + (process.env.PORT || process.env.GETINDEXROCKET_PORT || "3005"),
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || process.env.GETINDEXROCKET_PORT || "3005",
      },
    },
  ],
};
