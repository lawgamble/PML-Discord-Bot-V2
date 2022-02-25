FROM node:alpine

WORKDIR home/lawrence/discordbots/discord-bot-joe/bot

COPY . . 

RUN npm i

CMD ["node", "bot.js"]