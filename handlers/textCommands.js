const CommandManager = require('../commandManager.js')
const config = require('../config.json')
const fs = require('fs')
var textCommands = require('./textCommands.json')

function save(){
  fs.writeFileSync('./handlers/textCommands.json', JSON.stringify(textCommands))
}

Object.keys(textCommands).forEach((item, i) => {
  console.log(item, i)
  CommandManager.addHandler(item, (args,msg)=>msg.channel.send(textCommands[item]))
});

CommandManager.addHandler('addTextCommand', (args,msg)=>{
  //!addTextCommand testCommand more text follows
  if(args.length < 3 || !config.admins.includes(msg.author.id)){
    msg.channel.send("u ok bro?")
    return
  }
  var cmdName = args.splice(0,2)[1]
  textCommands[cmdName] = args.join(' ')
  CommandManager.addHandler(cmdName, (args,msg)=>msg.channel.send(textCommands[cmdName]))
  save()
  msg.channel.send(`Added or updated command ${cmdName}`)
})

CommandManager.addHandler('listTextCommands', (args,msg)=>{
  msg.channel.send(Object.keys(textCommands).join('\n'))
})

CommandManager.addHandler('listAllCommands', (args,msg)=>{
  msg.channel.send(Object.keys(CommandManager.handlers))
})
