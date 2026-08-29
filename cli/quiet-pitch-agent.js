#!/usr/bin/env node
const fs = require('fs');
const { handleReply, researchProspect } = require('../src/quietPitchCore');

function readJson(path) {
  const raw = path ? fs.readFileSync(path, 'utf8') : fs.readFileSync(0, 'utf8');
  return JSON.parse(raw);
}

function usage() {
  console.error('Usage: node cli/quiet-pitch-agent.js <research|reply> [input.json]');
  process.exit(1);
}

const mode = process.argv[2];
if (!['research', 'reply'].includes(mode)) usage();

try {
  const input = readJson(process.argv[3]);
  const output = mode === 'research'
    ? researchProspect(input.prospect || input, input.operator || {})
    : handleReply(input);
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
} catch (error) {
  console.error(JSON.stringify({ status: 'ERROR', error_message: error.message }, null, 2));
  process.exit(1);
}
