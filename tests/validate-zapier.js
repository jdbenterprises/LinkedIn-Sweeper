const fs = require('fs');
const vm = require('vm');

for (const file of ['zapier/mode1_research.js', 'zapier/mode2_reply.js']) {
  const source = fs.readFileSync(file, 'utf8');
  new vm.Script(`(async function(inputData) { ${source}\n})`);
  console.log(`Validated Zapier wrapper syntax: ${file}`);
}
