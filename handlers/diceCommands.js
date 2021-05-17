const CommandManager = require('../commandManager.js')
const fs = require('fs')
const { DiceRoller } = require('dice-roller-parser')
const roller = new DiceRoller();

var diceCommands = require('./diceCommands.json')

function save(){
  fs.writeFileSync('diceCommands.json', JSON.stringify(diceCommands))
}


CommandManager.addHandler('roll', (args,msg)=>{
  args.splice(0,1) //args array includes name of command by default. we don't need this here
  var input = args.join(' ')
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
