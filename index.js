const fs = require('fs');

const filename = 'chatbot_data_2018-10-02-1722';

function convertToCsv({ includeSynonyms } = { includeSynonyms: true }) {
  const input = require(`./input/${filename}.json`);
  const output = `output/${filename}.csv`;

  try {
    if (fs.existsSync(output)) {
      fs.unlinkSync(output);
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
      if (includeSynonyms) {
        let trimmed = '';
        // synonyms = synonyms.length > 0 ? `,${synonyms.replace(/,\s/g,',')}` : '';
        if (synonyms && synonyms.length > 0) {
          trimmed = '';
          synonyms.forEach((str) => {
            trimmed += `,${str.trim()}`
          })
        }
        csv = csv + `${type},${title}${trimmed}`;
      }
      else {
        csv = csv + `${type},${title}`;
      }
      if (i < input.length -1) {
        csv = csv + '\n';
      }
    })
    fs.writeFileSync(`${output}${includeSynonyms ? '' : '-no-synonyms.csv'}`, csv, { encoding: 'utf8' });
    console.log(`metrics: ${metrics.length}, reports: ${reports.length}, dimensions: ${dimensions.length}, other: ${other.length}`);
  } catch (err) {
    console.error(err);
  }
}

function sortTerms() {
  const input = require(`./input/${filename}`);
  const output = `output/${filename}-sort.csv`;

  try {
    if (fs.existsSync(output)) {
      fs.unlinkSync(output);
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
  } catch (err) {
    console.error(err);
  }
}
convertToCsv();
// convertToCsv({includeSynonyms: false});
// sortTerms();
