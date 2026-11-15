const http = require('http');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  const filePath = path.join(publicDir, reqPath);

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath);
    let contentType = 'text/plain';
    if (ext === '.html') contentType = 'text/html';
    else if (ext === '.css') contentType = 'text/css';
    else if (ext === '.js') contentType = 'application/javascript';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.json') contentType = 'application/json';
    else if (ext === '.glb') contentType = 'model/gltf-binary';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not Found: ' + reqPath);
  }
});

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

server.listen(8099, async () => {
  try {
    // Check root index.html
    const resHtml = await httpGet('http://localhost:8099/');
    const hasQuanta = resHtml.data.includes('QUANTA_CAT presents ......');
    const hasVarnit = resHtml.data.includes('Varnit Sharma');
    const hasHeroStrip = resHtml.data.includes('landing-team-hero-card');
    const hasModal = resHtml.data.includes('quanta-team-modal');
    const hasAvatar = resHtml.data.includes('avatar_varnit.svg');

    console.log('Verification Results:');
    console.log('- Contains QUANTA_CAT presents ...... Banner:', hasQuanta);
    console.log('- Contains Lead Varnit Sharma:', hasVarnit);
    console.log('- Contains Hero Team Strip:', hasHeroStrip);
    console.log('- Contains Team Dossier Modal:', hasModal);
    console.log('- Contains Varnit Avatar:', hasAvatar);

    // Check SVG Avatar
    const resAvatar = await httpGet('http://localhost:8099/images/team/avatar_varnit.svg');
    console.log('- Avatar Varnit status:', resAvatar.status);

    // Check JS controller
    const resJs = await httpGet('http://localhost:8099/js/landing_page.js');
    console.log('- Landing Page JS status:', resJs.status);

    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    server.close();
    process.exit(1);
  }
});
