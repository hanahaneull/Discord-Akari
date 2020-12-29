console.clear()
const fs = require('fs')
const logo = fs.readFileSync('./Akari.txt', 'utf8')
console.log(logo)
let config
try {
  config = require('./config')
} catch (e) {
  return console.log('RENAME config.example.js TO config.js')
}
const Discord = require('discord.js')
const client = new Discord.Client({
  messageCacheMaxSize: 10,
  messageCacheLifetime: 30,
  messageSweepInterval: 60,
  disabledEvents: [
    'GUILD_UPDATE',
    'GUILD_MEMBER_ADD',
    'GUILD_MEMBER_REMOVE',
    'GUILD_MEMBER_UPDATE',
    'GUILD_MEMBERS_CHUNK',
    'GUILD_ROLE_CREATE',
    'GUILD_ROLE_DELETE',
    'GUILD_ROLE_UPDATE',
    'GUILD_BAN_ADD',
    'GUILD_BAN_REMOVE',
    'CHANNEL_UPDATE',
    'CHANNEL_PINS_UPDATE',
    'MESSAGE_DELETE',
    'MESSAGE_DELETE_BULK',
    'MESSAGE_REACTION_ADD',
    'MESSAGE_REACTION_REMOVE',
    'MESSAGE_REACTION_REMOVE_ALL',
    'USER_UPDATE',
    'USER_NOTE_UPDATE',
    'USER_SETTINGS_UPDATE',
    'PRESENCE_UPDATE',
    'VOICE_STATE_UPDATE',
    'TYPING_START',
    'VOICE_SERVER_UPDATE',
    'RELATIONSHIP_ADD',
    'RELATIONSHIP_REMOVE'
  ],
  http: {
    version: 8,
    api: 'https://discord.com/api'
  }
})

/* CONFIG VALUE */
let startbet = config.startbet
let currentbet = startbet
let winning = 0
let losing = 0
let profit = 0
let loss = 0
let msgid = null

client.on('ready', () => {
  /* LOGGING */
  printConfig()
  setInterval(printStats, config.delaystats * 1000)

  /* BETTING */
  const channel = client.channels.find(x => x.id === config.channel)
  setInterval(async () => {
    if (currentbet > config.maxbet) {
      currentbet = startbet
    }
    await channel
      .send(`owocf ${currentbet} ${config.side || 'head'}`)
      .catch(e => {})
    channel
      .awaitMessages(
        x =>
          x.author.id === '408785106942164992' &&
          x.channel.id === config.channel &&
          x.content.includes('The coin spins'),
        {
          max: 1,
          time: 10000,
          errors: ['time']
        }
      )
      .then(x => {
        msgid = x.first().id
      })
      .catch(e => {})
  }, config.delay * 1000)
})

client.on('messageUpdate', async (oldmsg, newmsg) => {
  if (newmsg.id !== msgid) return
  if (newmsg.content.includes(' and you won')) {
    winning++
    profit = profit + currentbet
    console.log(`Win with ${currentbet} bet`)
    currentbet = currentbet + config.increment
  } else {
    losing++
    loss = loss + currentbet
    console.log(`Lose with ${currentbet} bet`)
    currentbet = startbet
  }
})

client.login(config.token).catch(e => {
  console.log(`[ERROR] ${e.message}`)
})

function printConfig () {
  console.log(`
[CONFIG]
    USER:          ${client.user.tag}
    CHANNEL:       ${
      client.channels.find(x => x.id === config.channel).name
    } (${client.channels.find(x => x.id === config.channel).guild.name})
    SIDE:          ${config.side}
    DELAY:         ${config.delay} seconds
    START BET:     ${config.startbet}
    INCREMENT BET: ${config.increment}
    MAX BET:       ${config.maxbet}`)
}

function printStats () {
  console.log(`
[STATS]
    TOTAL GAME:    ${winning + losing}
    TOTAL BET:     ${profit + loss}
    PROFIT:        ${profit}
    LOSS:          ${loss}`)
}
