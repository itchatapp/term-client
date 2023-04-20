import { Client } from '@zaunapp/client'
import prompts from 'prompts'
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'


const env = process.env
const exitOnCancel = (state) => {
	if (state.aborted) process.nextTick(() => process.exit(0))
}
const exit = (...args) => {
	console.error(...args)
	process.exit(1)
}
const { TOKEN } = await prompts([
	{
		type: 'password',
		name: 'TOKEN',
		message: 'Paste your account token..',
		initial: env['ZAUN_TOKEN'],
		onState: exitOnCancel
	}
])

const client = new Client()

client.on('error', console.error)
// client.on('debug', console.error)

client
	.login(TOKEN)
	.then(() => {
		console.log('Connected Successfully! ')
	})
	.catch((err) => {
		exit('an error occurred', err)
	})

const [channel, messages] = await new Promise((resolve) => {
	client.once('ready', async () => {
		console.log('client is ready, fetching messages..')
		const c = client.channels.cache.get('302651066405617665')
		const messages = await c.messages.fetch()
		console.log('fatched')
		resolve([c, messages])
	})
})

console.log('size', messages.size)

for (const msg of messages.values()) {
	console.log(`[${msg.author.id === client.user.id ? 'You' : msg.author.username}]: ${msg.content}`)
}

client.on('messageCreate', (msg) => {
	console.log(`[${msg.author.id === client.user.id ? 'You' : msg.author.username}]: ${msg.content}`)
})

while (client.readyAt) {
	const rl = readline.createInterface({ input, output })
	const content = await rl.question('Message: ')
	await channel.send(content)
	rl.close()
}
