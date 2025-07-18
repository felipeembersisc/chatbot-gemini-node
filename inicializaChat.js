import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Objeto contendo as implementações das funções
const funcoes = {
   taxaJurosParcelamento: ({ value }) => {
      const meses = typeof value === "string" ? parseInt(value) : value;
      let taxaDeJuros = 0;

      if (meses <= 6) {
         taxaDeJuros = 3;
      } else if (meses <= 12) {
         taxaDeJuros = 5;
      } else if (meses <= 24) {
         taxaDeJuros = 7;
      }

      return { taxaJuros: taxaDeJuros };
   }
};

// Declaração da função para a API do Gemini
const taxasJurosFunctionDeclaration = {
   name: "taxaJurosParcelamento",
   description:
      "Retorna a taxa de juros para parcelamento baseado na quantidade de meses",
   parameters: {
      type: Type.OBJECT,
      properties: {
         value: {
            type: Type.NUMBER,
            description: "Número de meses para parcelamento",
         },
      },
      required: ["value"],
   },
};

let chatSession;

const inicializaChat = () => {
   const ai = new GoogleGenAI({ apiKey: process.env.API_KEY_GEMINI });

   chatSession = ai.chats.create({
      model: "gemini-2.5-pro",
      history: [
         {
            role: "user",
            parts: [
               {
                  text: "Você é Jordi, um chatbot amigável que representa a empresa Jornada Viagens, que vende pacotes turísticos para destinos nacionais e internacionais. Você pode responder mensagens que tenham relação com viagens.",
               },
            ],
         },
         {
            role: "model",
            parts: [
               {
                  text: "Olá! Obrigado por entrar em contato com o Jornada Viagens. Antes de começar a responder sobre suas dúvidas, preciso do seu nome e endereço de e-mail.",
               },
            ],
         },
      ],
      config: {
         maxOutputTokens: 1000,
         tools: [
            {
               functionDeclarations: [
                  taxasJurosFunctionDeclaration
               ],
            },
         ],
      },
   });
};

export { chatSession, inicializaChat, funcoes };
