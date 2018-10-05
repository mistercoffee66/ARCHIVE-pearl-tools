const fs = require('fs');
const path = require('path');
const enquirer = new require('enquirer')();

enquirer.register('list', require('prompt-list'));

module.exports = class EntitiesImportPrep {
  static init() {
    const question = enquirer.question({
      message: 'Enter the input JSON path',
      name: 'inputPath'
    })
    enquirer.ask(question)
      .then((answer) => {
        convertToCsv(answer);
    })
  }
}

const convertToCsv = async ({ inputPath }) => {
  const input = require(path.resolve(process.cwd(), inputPath));
  const output = path.join(process.cwd(), 'output', `${path.basename(inputPath, '.json')}_entities.csv`);
  console.log(`Saving as ${path.join(process.cwd(), 'output', `${path.basename(inputPath, '.json')}_entities.csv`)}...`);

  try {
    if (fs.existsSync(output)) {
      const question = enquirer.question(    {
        type: 'list',
        name: 'overwrite',
        message: 'File already exists. Overwrite?',
        choices: [
          {name: true, value: 'overwrite'},
          {name: false, value: 'cancel'}
        ],
        default: false
      })
      const answer = await enquirer.ask(question);
      if (answer.overwrite) {
        fs.unlinkSync(output);
      } else {
        console.log('canceled')
        return false;
      }
    }
    let csv = '';
    let metrics = [];
    let reports = [];
    let dimensions = [];
    let other = [];

    input.forEach((record, i) => {
      let { synonyms, title, type } = record;
      switch (type) {
        case 'metric':
          if (metrics.indexOf(record) > -1) {
            console.error(`** duplicated metric title: ${title}`);
          }
          metrics.push(title);
          break;
        case 'report':
          if (reports.indexOf(record) > -1) {
            console.error(`** duplicated report title: ${title}`);
          }
          reports.push(title);
          break;
        case 'dimension':
          if (dimensions.indexOf(record) > -1) {
            console.error(`** duplicated dimension title: ${title}`);
          }
          dimensions.push(title);
          break;
        default: other.push(title); break;
      }
      let trimmed = '';
      // synonyms = synonyms.length > 0 ? `,${synonyms.replace(/,\s/g,',')}` : '';
      if (synonyms && synonyms.length > 0) {
        trimmed = '';
        synonyms.forEach((str) => {
          trimmed += `,${str.trim()}`
        })
      }
      csv = csv + `${type},${title}${trimmed}`;
      if (i < input.length -1) {
        csv = csv + '\n';
      }
    })
    fs.writeFileSync(output, csv, { encoding: 'utf8' });
    console.log('Done');
    console.log(`Metrics: ${metrics.length}, Reports: ${reports.length}, Dimensions: ${dimensions.length}, other: ${other.length}`);
  } catch (err) {
    console.error(err);
  }
}
