module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'venv/bin/uvicorn',
      args: 'server:app --host 0.0.0.0 --port 8001',
      cwd: '/var/www/html/velvetroom/backend',
      interpreter: 'none',
      env: {
        PYTHONPATH: '/var/www/html/velvetroom/backend'
      }
    },
    {
      name: 'frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/html/velvetroom/frontend'
    }
  ]
};
