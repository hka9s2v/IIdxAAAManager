module.exports = {
  apps: [{
    name: 'iidx-bpi-manager',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/IIdxAAAManager',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    time: true
  }]
}; 