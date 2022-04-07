'use strict'
const fs = require('fs');
const path = require('path');
const scrapeIt = require('scrape-it');
var argv = require('minimist')(process.argv.slice(2));

const shortcodesFile = path.join(__dirname, 'sortedShortcodes.txt');
const commands = {
  help: {
    name: 'help',
    description: 'Displays info about the commands',
    function: help,
  },
  sync: {
    name: 'sync',
    description: 'Updates the EmojiMap.ts file with the existing emojis on disk',
    function: overrideEmojiMap,
  },
  scrap: {
    name: 'scrap',
    description: 'Scraps all the emoji categories and its associated emojis from emojipedia.com looking for their shortcodes (ids).Finally, it stores all their ids in order in a txt file named ./sortedShortcodes.txt',
    function: scrap,
  },
  sort: {
    name: 'sort',
    description: 'Reads all the emojis from disk and renames them replacing their order prefix with their new position',
    function: sortEmojis,
  },
}

if (commands[argv._[0]]) {
  commands[argv._[0]].function.call();
}
else {
  commands.help.function.call();
}

/**
 * Reads all the emojis stored and returns an object where keys are the emojis categories
 * and its values are the associated emojis names (with extension)
 * @example {food: ['apple.png', 'corn.png'], symbol:['forbiden.png']}
 * @returns An object containing the categories and its emojis.
 */
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

/**
 * Updates the EmojiMap.ts file with the existing data on disk
 * @requires classifyEmojis
 */
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

/**
 * Scraps all the emoji categories and its associated emojis from emojipedia.com looking for their shortcodes (ids). 
 * Finally, it stores all their ids in order in a txt file named ./sortedShortcodes.txt
 */
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

/**
 * Reads all the emojis from disk and renames them replacing their order prefix with their new position
 */
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

//overrideEmojiMap();

function help() {
  console.log(Object.keys(commands).reduce((acc, c) => acc + `\x1b[33m ${commands[c].name}\x1b[0m:\t${commands[c].description}\n`, '\n'));
};