const fs = require('fs');
const path = require('path');

const controllersDir = './src/controllers';

fs.readdirSync(controllersDir).forEach(file => {
  if (file.endsWith('.ts')) {
    const filePath = path.join(controllersDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace all occurrences
    content = content.replace(/role !== 'admin'/g, "role !== 'super_admin'");
    content = content.replace(/role === 'admin'/g, "role === 'super_admin'");
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Updated ${file}`);
  }
});

console.log('\n✅ All controller files updated successfully!');
