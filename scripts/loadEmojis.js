'use strict'
const fs = require('fs');
const path = require('path');

function classifyEmojis() {
  const route = path.join(__dirname, '..', 'src', 'assets', 'img', 'emojis');
  let categories = fs.readdirSync(route);
  const res = {};
  categories.forEach(c => {
    if (c !== 'categories')
      res[c] = fs.readdirSync(path.join(route, c));
  });
  return res;
}

function overrideEmojiMap(value) {
  const route = path.join(__dirname, '..', 'src', 'app', 'services', 'emoji', 'emojisMap.ts');
  value = JSON
    .stringify(value)
    .replaceAll('\"', '\'')
    .replaceAll("',", "',\n");
  const data = `// noinspection SpellCheckingInspection\nexport class EmojisMap {\n\tpublic emojisMap=${value};\n}`;
  fs.writeFileSync(route, data);
  console.info('Caution: linting and beautify pending')
}

const emojis = classifyEmojis();
overrideEmojiMap(emojis);
