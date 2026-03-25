const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3000;
const CLIENT_ID = '197999';
const CLIENT_SECRET = '1cea1992565d4fd2d191c1a20e69a86cbd879e4d';

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  
  // 1) Redirect to Strava OAuth
  if (urlObj.pathname === '/auth/strava') {
    const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=http://localhost:${PORT}/exchange_token&approval_prompt=force&scope=read,activity:read_all`;
    res.writeHead(302, { Location: stravaAuthUrl });
    res.end();
    return;
  }

  // 2) Callback after login
  if (urlObj.pathname === '/exchange_token') {
    const code = urlObj.searchParams.get('code');
    if (!code) {
      res.writeHead(400);
      res.end('Missing code parameter');
      return;
    }
    
    // Exchange code for token
    const postData = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code'
    }).toString();

    const options = {
      hostname: 'www.strava.com',
      port: 443,
      path: '/oauth/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const stravaReq = https.request(options, (stravaRes) => {
      let body = '';
      stravaRes.on('data', chunk => { body += chunk; });
      stravaRes.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (data.access_token) {
            
            // a) Cache the token
            fs.writeFileSync('.strava_token.json', JSON.stringify({
              access_token: data.access_token,
              expires_at: data.expires_at,
              refresh_token: data.refresh_token
            }, null, 2));

            // b) Setup config.local.yaml for git-sweaty pipeline
            const configYaml = `source: strava\nstrava:\n  client_id: "${CLIENT_ID}"\n  client_secret: "${CLIENT_SECRET}"\n  refresh_token: "${data.refresh_token}"\n`;
            fs.writeFileSync('config.local.yaml', configYaml);

            // c) Render a loading page and spawn python sync script
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.write(`
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: monospace; background: #0f172a; color: #e5e7eb; padding: 20px; }
                  h2 { color: #38bdf8; }
                  pre { background: #1e293b; padding: 10px; border-radius: 8px; margin-top: 5px; white-space: pre-wrap; }
                  a { color: #38bdf8; text-decoration: none; font-size: 18px; font-weight: bold; border: 1px solid #38bdf8; padding: 10px; border-radius: 8px; display: inline-block; margin-top: 20px;}
                  a:hover { background: rgba(56, 189, 248, 0.2); }
                </style>
              </head>
              <body>
              <h2>Authentication successful! Fetching your data...</h2>
              <p>Please wait. The first sync may take several minutes as it downloads all your activities.</p>
              <div id="output"></div>
              <script>
                function appendLog(html) {
                  document.getElementById('output').innerHTML += html;
                  window.scrollTo(0, document.body.scrollHeight);
                }
              </script>
            `);

            const pythonProcess = spawn('python', ['scripts/run_pipeline.py']);
            
            pythonProcess.stdout.on('data', (out) => {
              const text = out.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
              res.write(`<script>appendLog("<pre>${text}</pre>");</script>`);
            });
            
            pythonProcess.stderr.on('data', (err) => {
              const text = err.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
              res.write(`<script>appendLog("<pre style='color: #ef4444'>${text}</pre>");</script>`);
            });
            
            pythonProcess.on('close', (exitCode) => {
              if (exitCode === 0) {
                res.write(`<script>appendLog("<br><p>Sync finished successfully! 🏃‍♂️</p>");</script>`);
                res.write('<a href="/">Go to your Dashboard &rarr;</a>');
              } else {
                res.write(`<script>appendLog("<br><p style='color: #ef4444'>Sync exited with code ${exitCode}. Check logs above.</p>");</script>`);
              }
              res.write('</body></html>');
              res.end();
            });

          } else {
            res.writeHead(500);
            res.end('Error retrieving token from Strava. Response: ' + body);
          }
        } catch (e) {
          res.writeHead(500);
          res.end('Error parsing token response: ' + e.message);
        }
      });
    });

    stravaReq.on('error', (e) => {
      res.writeHead(500);
      res.end('Request to Strava failed: ' + e.message);
    });

    stravaReq.write(postData);
    stravaReq.end();
    return;
  }

  // 3) Serve static frontend files
  let safePath = urlObj.pathname;
  if (safePath === '/') {
    safePath = '/index.html';
  }
  
  // Basic security to avoid directory traversal
  safePath = path.normalize(safePath).replace(/^(\.\.[\/\\])+/, '');
  
  const siteDir = path.join(__dirname, 'site');
  const filePath = path.join(siteDir, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // API fallback - might be asking for data.json that doesn't exist yet
      if (safePath === '/data.json') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end('null');
      }
      res.writeHead(404);
      return res.end('File not found: ' + safePath);
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(500);
        res.end('Internal Server Error: ' + error.code);
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================================`);
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Waiting for connection... `);
  console.log(`Open your browser and click "Link Strava" to begin!`);
  console.log(`=================================================`);
});
