const fs = require('fs');

const filename = 'reports-terms-2018-08-27';
const input = require(`./input/${filename}`);
const output = `output/${filename}.csv`;

try {
  if (fs.existsSync(output)) {
    fs.unlinkSync(output);
  }
  let csv = '';

  input.forEach((record, i) => {
    let { synonyms } = record;
    synonyms = synonyms.length > 0 ? `,${synonyms.replace(/,\s/g,',')}` : '';
    csv = csv + `${record.type},${record.title}${synonyms}`;
    if (i < input.length -1) {
      csv = csv + '\n';
    }
  })
  fs.writeFileSync(output, csv, { encoding: 'utf8' });
} catch (err) {
  console.error(err);
}
