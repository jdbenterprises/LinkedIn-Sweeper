const fs = require('fs');
const path = require('path');
const dist = path.join(process.cwd(), 'dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist);
for (const file of ['index.html']) fs.copyFileSync(file, path.join(dist, file));
fs.cpSync('src', path.join(dist, 'src'), { recursive: true });
console.log('Built static site to dist/');
