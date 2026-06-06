const fs = require('fs');
let content = fs.readFileSync('./src/data/mpx/mpx.ts', 'utf8');

let result = '';
let i = 0;
while (i < content.length) {
  if (content[i] === '`') {
    // Count preceding backslashes
    let numBackslashes = 0;
    let j = i - 1;
    while (j >= 0 && content[j] === '\\') {
      numBackslashes++;
      j--;
    }
    // If odd number of backslashes, current backtick is already escaped
    if (numBackslashes % 2 === 1) {
      result += content[i];
    } else {
      result += '\\`';
    }
  } else {
    result += content[i];
  }
  i++;
}
fs.writeFileSync('./src/data/mpx/mpx.ts', result);
console.log('Done escaping backticks');