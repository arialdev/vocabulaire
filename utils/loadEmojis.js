'use strict'
const fs = require('fs');
const path = require('path');
const scrapeIt = require('scrape-it');

const shortcodesFile = path.join(__dirname, 'sortedShortcodes.txt');


function classifyEmojis() {
  const route = path.join(__dirname, '..', 'src', 'assets', 'img', 'emojis');
  let categories = fs.readdirSync(route);
  const res = {};
  categories.forEach(c => {
    if (c !== 'categories')
      res[c] = fs.readdirSync(path.join(route, c)).sort((a, b) => {
        const idA = +a.split('_')[0];
        const idB = +b.split('_')[0];
        return idA > idB ? 1 : -1;
      });
  });
  return res;
}

function overrideEmojiMap() {
  let value = classifyEmojis();
  const route = path.join(__dirname, '..', 'src', 'app', 'services', 'emoji', 'emojisMap.ts');
  value = JSON
    .stringify(value)
    .replaceAll('\"', '\'')
    .replaceAll("',", "',\n");
  const data = `// noinspection SpellCheckingInspection\n/* eslint-disable */\nexport class EmojisMap {\n\tpublic emojisMap=${value};\n}`;
  fs.writeFileSync(route, data);
  console.info('Caution: linting and beautify pending');
}

async function scrap() {
  const route = 'https://emojipedia.org/';
  const categories = ['people', 'nature', 'food-drink', 'activity', 'travel-places', 'objects', 'symbols', 'flags'];

  let promises = [];

  for (let c of categories) promises.push(scrapeIt(route + c, {
    emojis: {
      listItem: '.emoji-list>li',
      data: {
        emoji: {
          selector: 'a',
          attr: 'href'
        }
      }
    }
  }));

  let emojis = (await Promise.all(promises)).flatMap(r => r.data.emojis).map(e => e.emoji);

  console.info(`Categories scrapped. ${emojis.length} emojis found from ${categories.length} categories.`)

  let res = [];
  for (let i = 0; i < emojis.length; i++) {
    let data = await scrapeIt(route + emojis[i], {
      shortcodes: {
        listItem: '.shortcodes li',
        data: {
          platform: {
            selector: 'a',
            attr: 'href'
          },
          shortcode: '.shortcode'
        }
      }
    })
    data = data.data.shortcodes.filter((s, _, arr) => arr.length > 1 ? s.platform === '/github/' : true).map(s => s.shortcode.match(/:(.+):/)[1])[0];
    if (data) {
      res.push(data);
      console.log(`${i}/${emojis.length}`, data.shortcode)
    }
  }
  console.info('Emojis scrapped')
  fs.writeFileSync(shortcodesFile, res.join('\n'));
  console.info('Emojis shortcodes saved to file', shortcodesFile);
  return res;
}

function sortEmojis() {
  const route = path.join(__dirname, '..', 'src', 'assets', 'img', 'emojis');
  let shortcodes = fs.readFileSync(shortcodesFile, 'utf8');
  shortcodes = shortcodes.split('\n');

  let emojis = classifyEmojis();
  console.log('Start file renaming...');
  Object.entries(emojis).forEach(entry => {
    const category = entry[0];
    const categoryEmojis = entry[1];
    console.log(`${category}:`)
    categoryEmojis.forEach((e, i) => {
      const newName = shortcodes.findIndex(s => s === e.match(/(.+)\./)[1])
      if (newName > 0)
        fs.renameSync(path.join(route, category, e), path.join(route, category, `${newName}_${e}`));
      console.log(`${i}/${categoryEmojis.length}`)
    })
  })
}

overrideEmojiMap();
