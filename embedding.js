import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY_GEMINI });

const normalizePdfText = (text) => {
  return text
      .replace(/\n/g, ' ') // remove quebras de linha
      .replace(/\s{2,}/g, ' ') // remove espaços duplicados
      .replace(/-\s+/g, '- ') // conserta hifens separados
      .replace(/([0-9])\.\s+/g, '\n$1. ') // reestrutura seções numeradas
      .trim();
}

const dividirPorSecoes = (texto) => {
  const secoes = texto.split(/(?=\d+\.\s+[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇa-záéíóúâêîôûãõç]+)/g);
  return secoes.map(secao => secao.trim()).filter(secao => secao.length > 0);
}


export const embedRetrievalQuery = async (queryText) => {
   const results = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: {
         parts: [{ text: queryText }]
      },
      taskType: 'RETRIEVAL_QUERY'
   });

   const embeddings = results.embeddings
   return embeddings.map((e) => e.values);
}

export const incorporarDocumentos = async (docTexts) => {
   const results = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: docTexts,
      taskType: 'RETRIEVAL_DOCUMENT',
   });

   const embeddings = results.embeddings
   return embeddings.map((e, i) => ({ text: docTexts[i], values: e.values }))
};

export const leArquivosTxt = async (arquivos) => {
   try {
      const documentos = [];
      for (const filePath of arquivos) {
         const documento = await fs.promises.readFile(filePath, 'utf-8');
         documentos.push(documento);
      }
      return documentos;
   } catch (error) {
      console.error('Erro ao ler os documentos', error);
      return [];
   }
}

export const leArquivosPDF = async (relativePdfPaths) => {
   const results = [];

   for (const relativePdfPath of relativePdfPaths) {
      try {
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

         let fullTextFormatted = normalizePdfText(fullText)
         fullTextFormatted = dividirPorSecoes(fullTextFormatted)

         results.push(fullTextFormatted);
      } catch (error) {
         console.error(`Erro ao processar ${relativePdfPath}:`, error);
         results.push(null);
      }
   }

   return results;
}

const euclideanDistance = (a, b) => {   
   let sum = 0;
   for (let n = 0; n < a.length; n++) {
      sum += Math.pow(a[n] - b[n], 2);
   }
   return Math.sqrt(sum);
}

export const incorporarPergunta = async (queryText, docs) => {
   const queryValues = await embedRetrievalQuery(queryText);

   let bestDoc = {};
   let minDistance = 1.0;

   for (const doc of docs) {
      let distance = euclideanDistance(doc.values, queryValues[0]);
      if (distance < minDistance) {
         minDistance = distance;
         bestDoc = doc.text;
      }
   }

   return bestDoc;
}
