module.exports = {
  apps: [
    {
      name: "pactio",
      script: "node_modules/next/dist/bin/next",
      args: "dev -H 0.0.0.0 -p 3002",
      cwd: "/home/ubuntu/pactio",
      autorestart: true,
      max_restarts: 30,
    },
  ],
};
