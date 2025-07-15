import { GoogleGenAI } from '@google/genai'
import dotenv from 'dotenv'

dotenv.config()

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY_GEMINI });

export const executaChat = async (mensagem) => {
  const chatSession = ai.chats.create({
    model: 'gemini-1.5-flash',
    history: [
      {
        role: 'user',
        parts: [
          { text: 'Você é Jordi, um chatbot amigável que representa a empresa Jornada Viagens, você pode responder mensagens referentes a pacotes turísticos, viagens e destinos diversos.' }
        ]
      },
      {
        role: 'model',
        parts: [
          { text: 'Olá! Obrigado por entrar em contato com a Jornada Viagens. Antes de responder suas dúvidas, pode me informar o seu nome?' }
        ]
      }
    ],
    config: {
      maxOutputTokens: 1000
    }
  })

  const resultado = await chatSession.sendMessage({
    message: {
      text: mensagem
    }
  })

  if (resultado.candidates && resultado.candidates.length > 0) {
    const candidates = resultado.candidates[0]
   
    if (candidates.content && candidates.content.parts.length > 0) {
      const texto = candidates.content.parts[0].text
      return texto
    }
  }
}
