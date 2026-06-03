const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const TEMPLATE_PATH = path.join(__dirname, '../templates/parent_letter.docx');

function generateMergedDoc(prospects, outputPath) {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    return Promise.reject(new Error('Template not found at ' + TEMPLATE_PATH));
  }

  const templateContent = fs.readFileSync(TEMPLATE_PATH, 'binary');
  const outputZip = new PizZip();

  for (const prospect of prospects) {
    const zip = new PizZip(templateContent);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '{', end: '}' },
    });

    doc.render({
      First_Name: prospect.First_Name,
      Last_Name: prospect.Last_Name,
      Email_Address: prospect.Email_Address,
    });

    const buf = doc.getZip().generate({ type: 'nodebuffer' });
    const fileName = `${prospect.Last_Name}_${prospect.First_Name}_letter.docx`;
    outputZip.file(fileName, buf);
  }

  const zipBuf = outputZip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(outputPath, zipBuf);
  return Promise.resolve(outputPath);
}

module.exports = { generateMergedDoc };
