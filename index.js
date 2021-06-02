const Discord = require('discord.js'); 
const bot = new Discord.Client();
const eval = require('eval');
const { promises: fs } = require("fs");

//подключаем файл конфигурации
let config = require('./bot-config.json'); 

//"достаём" токен и префикс
let token = config.token; 
let prefix = config.prefix;
let lastCommand = null;
let commandsList = [];




// Чтение команд из файлов в директории commands
async function readCommands() {
    try {
        let names = await fs.readdir("./commands");

        for (name of names) {
            let command = require(`././commands/${name}`);
            commandsList.push(command);
        }
    } catch (e) {
        console.log("e", e);
    }
}

// Вызов функции чтения команд
readCommands();

//создаём ссылку-приглашение для бота
bot.on('ready', () => { 
    console.log(`Запустился бот ${bot.user.username}`);

    bot.generateInvite(["ADMINISTRATOR"]).then(link => { 
        console.log(link);
    });
});

//команда, и то, что она должна выполнить
bot.on('message', async msg => {
    if (msg.author.bot)
        return;

    if (msg.content && msg.content[0] === prefix) {
        await processCommand(msg);
    }
});

async function processCommand(msg) {
    // Парсинг команды
    let cmdText = msg.content.substr(1);
    let cmd = cmdText.split(' ');

    // Исполнение команды
    let result = await executeCommand(cmd, msg);
    lastCommand = { command: cmd[0], args: cmd.slice(1) };

    // Добавление реакции на сообщение
    if (result) msg.react("👍");
    else msg.react("👎");
}

async function executeCommand(cmd, msg) {
    let command = cmd[0].toLowerCase();
    let args = cmd.slice(1);    

    // Поиск команды среди загруженных из файлов
    for (loadedCommand of commandsList) {
        if (loadedCommand.commandName == command) {
            return loadedCommand.execute(msg, args);
        }
    }

    if (command == "lastcmd") {
        return msg.reply(JSON.stringify(lastCommand, null, 2));
    }

    if (command == "calc") {
        let result = null;
        let forCalc = `exports.result = (${args.join("")})`;

        try { result = eval(forCalc).result; }
        catch (err)
        {
            msg.reply("ERR");
            return null;
        }

        return msg.reply(result);
    }

    if (command == "ghoul") {
        msg.react("👍");

        for (let i = 1000; i > 0; i -= 7) {
            msg.channel.send(`${i}-7=?`);
            await sleep(1000);

            let count = 0;

            let cache = msg.reactions.cache.first();
            if (cache) count = cache.count;

            if (count > 1) {
                return msg.channel.send(`Ghoul naelsa.`);
            }
        }
        11
        return msg.channel.send(`Ghoul naelsa.`);;
    }

    msg.reply("Ваша команда не распознана, введите >lastcmd чтобы узнать детали");
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}   

bot.login(token);