import { Message } from '@/models'
import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser'
import OpenAI from 'openai'
import { MessageContentText } from 'openai/resources/beta/threads/messages/messages'

export const config = {
  runtime: 'edge'
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const { messages } = (await req.json()) as {
      messages: Message[]
    }

    const charLimit = 12000
    let charCount = 0
    let messagesToSend = []

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i]
      if (charCount + message.content.length > charLimit) {
        break
      }
      charCount += message.content.length
      messagesToSend.push(message)
    }

    const useAzureOpenAI =
      process.env.AZURE_OPENAI_API_BASE_URL && process.env.AZURE_OPENAI_API_BASE_URL.length > 0

    let apiUrl: string
    let apiKey: string
    let model: string
    if (useAzureOpenAI) {
      let apiBaseUrl = process.env.AZURE_OPENAI_API_BASE_URL
      const version = '2023-05-15'
      const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || ''
      if (apiBaseUrl && apiBaseUrl.endsWith('/')) {
        apiBaseUrl = apiBaseUrl.slice(0, -1)
      }
      apiUrl = `${apiBaseUrl}/openai/deployments/${deployment}/chat/completions?api-version=${version}`
      apiKey = process.env.AZURE_OPENAI_API_KEY || ''
      model = '' // Azure Open AI always ignores the model and decides based on the deployment name passed through.
    } else {
      let apiBaseUrl = process.env.OPENAI_API_BASE_URL || 'https://api.openai.com'
      if (apiBaseUrl && apiBaseUrl.endsWith('/')) {
        apiBaseUrl = apiBaseUrl.slice(0, -1)
      }
      apiUrl = `${apiBaseUrl}`
      apiKey = process.env.OPENAI_API_KEY || ''
      model = 'asst_TbJnHiF5qJVtv2n5j3QolHKd' // todo: allow this to be passed through from client and support gpt-4
    }
    const stream = await OpenAIStream(apiKey, model, messagesToSend)

    return new Response(stream)
  } catch (error) {
    console.error(error)
    return new Response('Error', { status: 500 })
  }
}

const OpenAIStream = async (apiKey: string, model: string, messages: Message[]) => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const openai = new OpenAI({ apiKey })

  // create thread
  let run = await openai.beta.threads.createAndRun({
    assistant_id: model,
    thread: {
      messages: messages.map((message) => {
        return {
          content: message.content,
          role: 'user'
        }
      })
    },
    tools: [
      {
        type: 'retrieval'
      }
    ]
  })

  while (run.status === 'queued' || run.status === 'in_progress') {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    run = await openai.beta.threads.runs.retrieve(run.thread_id, run.id)
  }

  const messagesResponse = await openai.beta.threads.messages.list(run.thread_id, { order: 'desc' })

  return (messagesResponse.data[0].content[0] as MessageContentText).text.value
}
export default handler
