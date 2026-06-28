const fs = require('fs');
const content = fs.readFileSync('admin/index.html', 'utf8');

// Extract script blocks
const regex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let scriptCount = 0;

while ((match = regex.exec(content)) !== null) {
  scriptCount++;
  const scriptContent = match[1].trim();
  if (!scriptContent) continue;
  
  const startLine = content.substring(0, match.index).split('\n').length;
  console.log(`Checking script ${scriptCount} starting at line ${startLine}`);
  
  try {
    // We can use the Function constructor or just save to a temp file and require it.
    // However, some use import statements which Function constructor hates.
    // Instead, we just save to a temp file and run a basic syntax check.
    const tempFile = `temp_script_${scriptCount}.js`;
    // We add empty lines before it so the line numbers match!
    const padding = '\n'.repeat(startLine - 1);
    fs.writeFileSync(tempFile, padding + scriptContent, 'utf8');
    
    // Check syntax using node
    const execSync = require('child_process').execSync;
    try {
      execSync(`node --check ${tempFile}`, { stdio: 'pipe' });
      console.log(`Script ${scriptCount} is valid.`);
    } catch (err) {
      console.error(`Syntax error in script ${scriptCount}:`);
      console.error(err.stderr.toString());
    }
  } catch (err) {
    console.error(err);
  }
}
