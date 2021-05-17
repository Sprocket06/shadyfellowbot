const config = require('./config.json')

class CommandManager {
  constructor(){
    this.handlers = {}
    this.logChannel
    this.experimentalCommands = []
  }
  handleMessage(msg){
    let args = msg.content.trim().replace(/\s{2,}/g," ").split(' ')
      , cmd = args[0];
    if(this.handlers[cmd]){
      let l = `user: ${msg.author.username} (id: ${msg.author.id}) cmd: ${msg.content}
args (${args.length}): ${args}`
      global.log(l)
      this.handlers[cmd](args,msg);
    }
  }
  addHandler(name,fn,isTestFeature){
    this.handlers[name] = fn
  }
  removeHandler(name){
    delete this.handlers[name];
  }
}

module.exports = new CommandManager();
