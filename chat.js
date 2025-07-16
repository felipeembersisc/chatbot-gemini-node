import { chatSession } from './inicializaChat.js'

export const executaChat = async (mensagem) => {
  console.log('Tamanho do histórico: ' + await chatSession.getHistory().length)
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
