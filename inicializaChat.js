import { GoogleGenAI } from '@google/genai'
import dotenv from 'dotenv'

dotenv.config()

let chatSession

const inicializaChat = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY_GEMINI });

  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    history: [
      {
        role: 'user',
        parts: [
          { text: 'Você é Jordi, um chatbot amigável que representa a empresa Jornada Viagens, que vende pacotes turísticos para destinos nacionais e internacionais. Você pode responder mensagens que tenham relação com viagens.' }
        ]
      },
      {
        role: 'model',
        parts: [
          { text: 'Olá! Obrigado por entrar em contato com o Jornada Viagens. Antes de começar a responder sobre suas dúvidas, preciso do seu nome e endereço de e-mail.' }
        ]
      }
    ],
    config: {
      maxOutputTokens: 1000
    }
  })
}

export { chatSession,inicializaChat }