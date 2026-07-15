module.exports = {
  apps: [
    {
      name: "aiot-hub",
      cwd: "/home/pi/DEV/Training/myIoTM3/AIoT",
      script: "npm",
      args: "run start -- -p 3000 -H 0.0.0.0",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 5000,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0"
      },
      error_file: "./logs/aiot-hub-error.log",
      out_file: "./logs/aiot-hub-out.log",
      time: true
    }
  ]
};
