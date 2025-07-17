import { GoogleGenAI } from '@google/genai';
import { promises as fs } from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY_GEMINI });

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

export const leArquivos = async (arquivos) => {
   try {
      const documentos = [];
      for (const filePath of arquivos) {
         const documento = await fs.readFile(filePath, 'utf-8');
         documentos.push(documento);
      }
      return documentos;
   } catch (error) {
      console.error('Erro ao ler os documentos', error);
      return [];
   }
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
