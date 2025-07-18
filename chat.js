import { chatSession, funcoes } from './inicializaChat.js';
import { incorporarDocumentos, incorporarPergunta, lerArquivos} from './embedding.js';

const arquivos = await lerArquivos(['./Pacotes_EUA.docx', './Pacotes_Argentina.txt']);
const documentos = await incorporarDocumentos(arquivos);
// console.log(documentos)

export const executaChat = async (mensagem) => {
   let doc = await incorporarPergunta(mensagem, documentos);
   let prompt = mensagem + ' talvez esse trecho te ajude a formular a resposta ' + doc

   const resultado = await chatSession.sendMessage({
      message: { text: prompt }
   });

   if (resultado.candidates && resultado.candidates.length > 0) {
      const content = resultado.candidates[0].content;
      const textPart = content.parts.map(({ text }) => text).join('');

      const fc = content.parts[0].functionCall;

      if (fc) {
         const { name, args } = fc;
         const fn = funcoes[name];

         if (!fn) {
            throw new Error(`Unknown function '${name}'`);
         }

         const requestFc = [
            {
               functionResponse: {
                  name,
                  response: {
                     name,
                     content: funcoes[name](args),
                  },
               },
            },
         ];

         const resultadoFc = await chatSession.sendMessage({
            message: requestFc,
         });

         const contentFc = resultadoFc.candidates[0].content;
         const textPartFc = contentFc.parts.map(({ text }) => text).join('');

         return textPartFc;
      } else {
         return textPart;
      }
   }
};
