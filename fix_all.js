const fs = require('fs');
const files = [
  'admin/index.html',
  'pages/test.html',
  'pages/junior-dashboard.html',
  'pages/senior-dashboard.html',
  'pages/leaderboard.html',
  'js/data.js'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let fixed = content.replace(/[\u201C\u201D]/g, '"');
    fixed = fixed.replace(/[\u2018\u2019]/g, "'");
    
    // Fix previously escaped string interpolations from bad AI generations
    fixed = fixed.replace(/\\\$\{/g, '${');
    
    // Fix previously escaped backticks
    fixed = fixed.replace(/\\`/g, "`");
    
    if (fixed !== content) {
      fs.writeFileSync(file, fixed, 'utf8');
      console.log('Fixed quotes/backticks in ' + file);
    }
  }
}
