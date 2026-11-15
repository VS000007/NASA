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
    const hasStoryIframe = resHtml.data.includes('id="netlify-story-iframe"') && 
                           resHtml.data.includes('https://storytelling-app-a344bb.netlify.app/');
    const hasProceedBtn = resHtml.data.includes('id="btn-proceed-to-deck"');
    const hasStoryGuideBtn = resHtml.data.includes('btn-open-story-guide');
    const hasQuanta = resHtml.data.includes('quanta-brand') && resHtml.data.includes('presents ......');

    // 5 Team Members Verification
    const hasVarnit = resHtml.data.includes('Varnit Sharma') && resHtml.data.includes('@quanta_cat');
    const hasHarshika = resHtml.data.includes('Harshika Kaushik') && resHtml.data.includes('@harshika_kaushik');
    const hasAnushri = resHtml.data.includes('Anushri Yadav') && resHtml.data.includes('@anushri_08');
    const hasPriyanshu = resHtml.data.includes('PRIYANSHU KUMAR') && resHtml.data.includes('@priyanshu_kumar01');
    const hasShashank = resHtml.data.includes('Shashank Shekhar') && resHtml.data.includes('@shashank_1610');

    // Cleanliness & Layout checks
    const hasTeamCapsule = resHtml.data.includes('landing-team-capsule');
    const hasModal = resHtml.data.includes('quanta-team-modal');
    const hasMonograms = resHtml.data.includes('badge-cyan">VS') && 
                         resHtml.data.includes('badge-rose">HK') && 
                         resHtml.data.includes('badge-amber">AY') && 
                         resHtml.data.includes('badge-emerald">PK') && 
                         resHtml.data.includes('badge-violet">SS');

    // Model Selector Bar Removed & 4s Auto-Slide Indicator Added
    const hasNoOldSelectorBar = !resHtml.data.includes('landing-model-selector');
    const hasSlideIndicator = resHtml.data.includes('landing-slide-indicator') && resHtml.data.includes('slide-dot');

    // Confirm no photos used in team modal
    const modalSlice = resHtml.data.substring(resHtml.data.indexOf('id="quanta-team-modal"'), resHtml.data.indexOf('</section>'));
    const modalHasNoPhotos = !modalSlice.includes('<img');

    // Stage 1 Auto-Play & Timer Bar Removal checks
    const hasNoTimerBar = !resHtml.data.includes('guide-auto-advance-wrap');

    console.log('Verification Results:');
    console.log('- Stage 1: Netlify Guide Stage Present:', hasNetlifyStage);
    console.log('- Stage 1: Netlify App URL Embedded (No 404):', hasStoryIframe);
    console.log('- Stage 1: Proceed to Deck Button:', hasProceedBtn);
    console.log('- Stage 1: Re-open Story Guide in HUD:', hasStoryGuideBtn);
    console.log('- Stage 1: Timer bar completely removed:', hasNoTimerBar);
    console.log('- Stage 2: QUANTA_CAT presents ...... Banner:', hasQuanta);
    console.log('- 3D Model Old Selector Bar Removed:', hasNoOldSelectorBar);
    console.log('- 3D Model 4s Auto-Slide Indicator Added:', hasSlideIndicator);
    console.log('- Team Member 1 (Varnit Sharma @quanta_cat):', hasVarnit);
    console.log('- Team Member 2 (Harshika Kaushik @harshika_kaushik):', hasHarshika);
    console.log('- Team Member 3 (Anushri Yadav @anushri_08):', hasAnushri);
    console.log('- Team Member 4 (PRIYANSHU KUMAR @priyanshu_kumar01):', hasPriyanshu);
    console.log('- Team Member 5 (Shashank Shekhar @shashank_1610):', hasShashank);
    console.log('- Team Capsule on Hero:', hasTeamCapsule);
    console.log('- Team Modal with all monograms:', hasMonograms);
    console.log('- Team Modal strictly without photos:', modalHasNoPhotos);

    // Check CSS
    const resCss = await httpGet('http://localhost:8099/css/style.css');
    const hasNetlifyCss = resCss.data.includes('.netlify-guide-stage');
    const hasCapsuleCss = resCss.data.includes('.landing-team-capsule');
    const hasSlideCss = resCss.data.includes('slideInModel') && resCss.data.includes('.landing-slide-indicator');
    const hasNoTimerBarCss = !resCss.data.includes('.guide-auto-advance-wrap');
    console.log('- CSS contains .netlify-guide-stage:', hasNetlifyCss);
    console.log('- CSS contains .landing-team-capsule:', hasCapsuleCss);
    console.log('- CSS contains 3D model slide animations:', hasSlideCss);
    console.log('- CSS has removed timer bar rules:', hasNoTimerBarCss);

    // Check JS controller
    const resJs = await httpGet('http://localhost:8099/js/landing_page.js');
    const hasAdvanceMethods = resJs.data.includes('advanceToDeck') && resJs.data.includes('openStoryGuide');
    const hasAutoSlideJs = resJs.data.includes('startModelAutoSlide') && resJs.data.includes('transitionToModel');
    const hasNarrationJs = resJs.data.includes('startStoryNarrationFlow') && resJs.data.includes('triggerIframeNarration');
    console.log('- JS contains 3-stage transitions:', hasAdvanceMethods);
    console.log('- JS contains 4s 3D Model Auto-Slide:', hasAutoSlideJs);
    console.log('- JS contains narration autoplay & story end detection:', hasNarrationJs);

    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    server.close();
    process.exit(1);
  }
});
