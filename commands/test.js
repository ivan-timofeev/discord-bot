
module.exports = {
    commandName: "test",
    execute: async function (msg, args) {
        return msg.channel.send(`tests is works`);
    }
}