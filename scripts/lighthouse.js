const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

async function runLighthouse() {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  };
  
  const runnerResult = await lighthouse('http://localhost:3000', options);
  
  // Save report
  const reportHtml = runnerResult.report;
  fs.writeFileSync('lighthouse-report.html', reportHtml);
  
  // Log scores
  const scores = runnerResult.lhr.categories;
  console.log('Lighthouse Scores:');
  console.log(`Performance: ${scores.performance.score * 100}`);
  console.log(`Accessibility: ${scores.accessibility.score * 100}`);
  console.log(`Best Practices: ${scores['best-practices'].score * 100}`);
  console.log(`SEO: ${scores.seo.score * 100}`);
  
  await chrome.kill();
}

runLighthouse().catch(console.error);

