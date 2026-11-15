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
    const hasNetlifyStage = resHtml.data.includes('id="netlify-guide-stage"');
    const hasNetlifyUrl = resHtml.data.includes('https://storytelling-app-a344bb.netlify.app/');
    const hasProceedBtn = resHtml.data.includes('id="btn-proceed-to-deck"');
    const hasStoryGuideBtn = resHtml.data.includes('btn-open-story-guide');
    const hasQuanta = resHtml.data.includes('quanta-brand') && resHtml.data.includes('presents ......');
    const hasVarnit = resHtml.data.includes('Varnit Sharma');
    const hasHeroStrip = resHtml.data.includes('landing-team-hero-card');
    const hasModal = resHtml.data.includes('quanta-team-modal');
    const hasAvatar = resHtml.data.includes('avatar_varnit.svg');

    console.log('Verification Results:');
    console.log('- Stage 1: Netlify Guide Stage Present:', hasNetlifyStage);
    console.log('- Stage 1: Netlify URL Embedded:', hasNetlifyUrl);
    console.log('- Stage 1: Proceed to Deck Button:', hasProceedBtn);
    console.log('- Stage 1: Re-open Story Guide in HUD:', hasStoryGuideBtn);
    console.log('- Stage 2: QUANTA_CAT presents ...... Banner:', hasQuanta);
    console.log('- Stage 2: Lead Varnit Sharma Mentioned:', hasVarnit);
    console.log('- Stage 2: Hero Team Strip:', hasHeroStrip);
    console.log('- Stage 2: Team Dossier Modal:', hasModal);
    console.log('- Stage 2: Varnit Avatar SVG:', hasAvatar);

    // Check CSS
    const resCss = await httpGet('http://localhost:8099/css/style.css');
    const hasNetlifyCss = resCss.data.includes('.netlify-guide-stage');
    console.log('- CSS contains .netlify-guide-stage:', hasNetlifyCss);

    // Check JS controller
    const resJs = await httpGet('http://localhost:8099/js/landing_page.js');
    const hasAdvanceMethods = resJs.data.includes('advanceToDeck') && resJs.data.includes('openStoryGuide');
    console.log('- JS contains 3-stage transitions:', hasAdvanceMethods);

    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    server.close();
    process.exit(1);
  }
});
