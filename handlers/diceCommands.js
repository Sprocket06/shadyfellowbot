const CommandManager = require('../commandManager.js')
const fs = require('fs')
const { DiceRoller } = require('dice-roller-parser')
const roller = new DiceRoller();

var Characters = require('./characters.json')
var diceCommands = require('./diceCommands.json')

function save(){
  fs.writeFileSync('diceCommands.json', JSON.stringify(diceCommands))
}

function preprocess(input, cID){
  var C = Characters[cID]
  input = input.replace(/<#(\w+)>/g, (match, stat, index)=>{
    if(!C){
      throw new Error('Character stats do not exist!')
    }
    var fill = C.xp[stat]
    if(!fill){
      throw new Error(`Unknown stat ${stat}`)
    }
    return C.xp[stat].current
  })
  return input
}

CommandManager.addHandler('ror2', (args,msg)=>{
  const characters = 'Commando,Huntress,Bandit,MUL-T,Engineer,Artificer,Mercenary,Rex,Loader,Acrid,Captain'.split(',')
  msg.channel.send(characters[Math.floor(Math.random() * characters.length)]);
})

CommandManager.addHandler('roll', (args,msg)=>{
  args.splice(0,1) //args array includes name of command by default. we don't need this here
  var input = preprocess(args.join(' '), msg.author.id)
    , roll = roller.roll(input)
    , output = []
  if(roll.type == 'expressionroll'){
    roll.dice.forEach((item, i) => {
      if(i!=0){
        if(roll.ops[i-1]){
          output.push(roll.ops[i-1])
        }
      }
      if(item.type == 'die'){
        if(item.rolls.length == 1){
          output.push(item.rolls[0].value)
        }else{
          output.push(`[${item.rolls.map(_=>_.value).join(', ')}]`)
        }
      }else if(item.type == 'number'){
        output.push(item.value)
      }
    });
  }else if(roll.type == 'die'){
    if(roll.rolls.length == 1){
      output.push(roll.rolls[0].value)
    }else{
      output.push(`[${roll.rolls.map(_=>_.value).join(', ')}]`)
    }
  }
  msg.channel.send(`Input: ${input}
Rolls: ${output.join(' ')}
Total: ${roll.value}`)
})
