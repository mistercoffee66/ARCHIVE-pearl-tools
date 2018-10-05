const fs = require('fs');
const path = require('path');
const enquirer = new require('enquirer')();

enquirer.register('list', require('prompt-list'));

module.exports = class TermsAndSynonymsExport {
  static init() {
    const question = enquirer.question({
      message: 'Enter the input JSON path',
      name: 'inputPath'
    })
    enquirer.ask(question)
    .then((answer) => {
      return sortTerms(answer);
    })
  }
}

const sortTerms = async ({ inputPath }) => {
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
    let csv = 'Term,Type,Synonym For';
    let terms = [];

    input.forEach((record, i) => {
      const { synonyms, title, type } = record;
      terms.push({
        term: title.toLowerCase(),
        type
      })
      if (synonyms && synonyms.length > 0) {
        synonyms.forEach((str) => {
          terms.push({
            term: str.trim().toLowerCase(),
            type: 'synonym',
            for: title.toLowerCase()
          })
        })
      }
    })
    terms.sort((a, b) => {
      return a.term > b.term ? 1 : a.term < b.term ? -1 : 0;
    })
    terms.forEach((term) => {
      csv += '\n' + term.term + ',' + term.type + (term.for ? (',' + term.for) : '');
    })
    fs.writeFileSync(output, csv, { encoding: 'utf8' });
    console.log('Done');
    console.log(`Total terms and synonyms: ${terms.length}`);
  } catch (err) {
    console.error(err);
  }
};
