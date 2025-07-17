import { chatSession, funcoes } from "./inicializaChat.js";
import { incorporarDocumentos, incorporarPergunta } from "./embedding.js";

const documentos = await incorporarDocumentos([
   "A política de cancelamento é de 30 dias antes da viagem, caso contrário, não haverá reembolso",
   "Viagem para a Disney de 5 dias é R$ 10.000,00",
   "Viagem para a Disney de 10 dias é R$ 20.000,00",
]);

export const executaChat = async (mensagem) => {
   let doc = await incorporarPergunta(mensagem, documentos);
   let prompt = mensagem + ' talvez esse trecho te ajude a formular a resposta ' + doc

   const resultado = await chatSession.sendMessage({
      message: { text: prompt }
   });

   if (resultado.candidates && resultado.candidates.length > 0) {
      const content = resultado.candidates[0].content;
      const textPart = content.parts.map(({ text }) => text).join("");

      const fc = content.parts[0].functionCall;

      if (fc) {
         const { name, args } = fc;
         const fn = funcoes[name];

         if (!fn) {
            throw new Error(`Unknown function "${name}"`);
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
         const textPartFc = contentFc.parts.map(({ text }) => text).join("");

         return textPartFc;
      } else {
         return textPart;
      }
   }
};
