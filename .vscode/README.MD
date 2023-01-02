Register webhook
`curl -F "url=https://azappmantgbot.azurewebsites.net/api/HttpTrigger1" https://api.telegram.org/bot<TOKEN_BOT>/setWebhook`

delete webhook
`curl  https://api.telegram.org/bot<TOKEN_BOT>/deleteWebhook`