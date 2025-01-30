const crypto = require('node:crypto');

async function main() {
  try {
    const str = process.argv[2];
    if (!str) throw new Error('No string provided!');
    const hash = await crypto.hash('sha256', str);
    console.log(hash);
  } catch (error) {
    console.error(error);
  }
}

main();
