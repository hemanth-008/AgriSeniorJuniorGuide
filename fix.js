const fs = require('fs');
let content = fs.readFileSync('admin/index.html', 'utf8');

// The agent might have accidentally output \${ instead of ${ in template literals. Let's fix that.
content = content.replace(/\\\$\{/g, '${');

fs.writeFileSync('admin/index.html', content, 'utf8');
console.log('Fixed \\${ in admin/index.html');
