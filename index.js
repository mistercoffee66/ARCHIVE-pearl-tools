const fs = require('fs');

const filename = 'reports-terms-2018-08-27';
const input = require(`./input/${filename}`);
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
    synonyms = synonyms.length > 0 ? `,${synonyms.replace(/,\s/g,',')}` : '';
    csv = csv + `${type},${title}${synonyms}`;
    if (i < input.length -1) {
      csv = csv + '\n';
    }
  })
  fs.writeFileSync(output, csv, { encoding: 'utf8' });
  console.log(`metrics: ${metrics.length}, reports: ${reports.length}, dimensions: ${dimensions.length}, other: ${other.length}`);
} catch (err) {
  console.error(err);
}
