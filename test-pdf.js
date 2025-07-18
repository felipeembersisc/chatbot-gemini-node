import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const extractTextFromPDF = async (relativePdfPath) => {
  const pdfPath = path.resolve(__dirname, relativePdfPath);
  const rawData = new Uint8Array(fs.readFileSync(pdfPath));

  const loadingTask = pdfjsLib.getDocument({ data: rawData });
  const pdf = await loadingTask.promise;

  let fullText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const strings = content.items.map((item) => item.str);
    fullText += strings.join(' ') + '\n';
  }

  return fullText;
};

const text = await extractTextFromPDF('./Políticas_do_Jornada_Viagens.pdf');
console.log(text);
