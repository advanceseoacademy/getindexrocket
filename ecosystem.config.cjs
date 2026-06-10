/** PM2 — production: npm run start:prod (migrate + next start) */
module.exports = {
  apps: [
    {
      name: "getindexrocket",
      cwd: __dirname,
      script: "npm",
      args: "run start:prod",
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
