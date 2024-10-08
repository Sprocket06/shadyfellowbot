const CommandManager = require('../commandManager.js')
const Config = require('../config.json')
const fs = require('fs')
var Characters = require('./characters.json')
var Abilities = require('../data/abilities.json')
var CurrentCharacter = require('../data/Players.json');
var Items = require('../data/items.json')

function updateCharacterFormat()
{
  var players = Object.keys(Characters);
  players.forEach(player => {
    CurrentCharacter[player] = 0;
    Characters[player] = [Characters[player]];
  })  
}

function hasCharacters(id)
{
  return Characters.hasOwnProperty(id);
}

function saveCharData(){
  fs.writeFileSync('./handlers/characters.json', JSON.stringify(Characters,null,2))
  //fs.writeFileSync('../data/Players.json', JSON.stringify(CurrentCharacter,null,2))
}

function newChar(){
  return {
    name: "John Doe",
    crew: "",
    alias: "",
    heritage: "",
    background: "",
    vice: "",
    heal_clock: {type:"clock",total:4,current:0},
    stress: {type:"gauge",total:9,current:0},
    trauma: [],
    harm: [[],[],[]],
    armor: {light:false,heavy:false,special:false},
    class: "Cutter",
    xp : {
      playbook: {type:'gauge', total:8, current:0},
      insight: {type:'gauge', total:6, current:0},
      prowess: {type:'gauge', total:6, current:0},
      resolve: {type:'gauge', total:6, current:0},
      hunt:{type:'gauge', total:4, current:0},
      study:{type:'gauge', total:4, current:0},
      survey:{type:'gauge', total:4, current:0},
      tinker:{type:'gauge', total:4, current:0},
      finesse:{type:'gauge', total:4, current:0},
      prowl:{type:'gauge', total:4, current:0},
      skirmish:{type:'gauge', total:4, current:0},
      wreck:{type:'gauge', total:4, current:0},
      attune:{type:'gauge', total:4, current:0},
      command:{type:'gauge', total:4, current:0},
      consort:{type:'gauge', total:4, current:0},
      sway:{type:'gauge', total:4, current:0}
    },
    abilities: [],
    items: [],
    contacts:[],
    load: 0,
    coin:0,
    stash: 0,
    clocks: []
  }
}

function renderGauge(g){
  return `[${'⬤'.repeat(g.current)}${'⭘'.repeat(g.total - g.current)}]`
}

function incGauge(g,amt){
  if(amt < 0){
    g.current = Math.max(g.current + amt, 0)
  }else{
    g.current = Math.min(g.current + amt, g.total)
  }
}

function CB(bool){
  return bool ? '⬤' : '⭘'
}

function align(str){
  str = str.split('\n')
  var l = [...str].sort((a,b)=> a.indexOf(':') < b.indexOf(':') ? 1 : -1)[0].indexOf(':')
  return str.map(line=>
  {
    //console.log(l,l - line.indexOf(':'))
    return ' '.repeat(l - line.indexOf(':')) + line
  }).join('\n')
}

function renderChar(sheet){
  var harmMaxLen = [
    sheet.harm[0].length ? sheet.harm[0].sort((a,b)=>a<b?1:-1)[0] : 0,
    sheet.harm[1].length ? sheet.harm[1].sort((a,b)=>a<b?1:-1)[0] : 0,
    sheet.harm[2].length ? sheet.harm[2].sort((a,b)=>a<b?1:-1)[0] : 0
  ]
  return `*${sheet.name.split(' ')[0]} ${sheet.alias?`"${sheet.alias}"`:''} ${sheet.name.split(' ')[1]}*
Affiliation: *${sheet.crew?sheet.crew:'None'}*
Heritage: *${sheet.heritage?sheet.heritage:'None'}*
Background: *${sheet.background?sheet.background:'None'}*
Look: *${sheet.look?sheet.look:'Covered in semen. (You don\'t like it, change it.)'}*
Vice: *${sheet.vice?sheet.vice:'None'}*

__Stats:__
\`\`\`
Stress: ${renderGauge(sheet.stress)}
Trauma: ${sheet.trauma.length?sheet.trauma.join(' - '):'None'}
Harm:
lv.3| ${sheet.harm[2].length?sheet.harm[2]:'None'}
lv.2| ${sheet.harm[1].length?sheet.harm[1].join(', '):'None'}
1v.1| ${sheet.harm[0].length?sheet.harm[0].join(', '):'None'}
Healing: ${sheet.heal_clock.current}/${sheet.heal_clock.total}
Armor: Light ${CB(sheet.armor.light)} Heavy ${CB(sheet.armor.heavy)} Special ${CB(sheet.armor.special)}

Coin: ${sheet.coin}
Stash: ${sheet.stash} (${(sheet.stash <= 10)?"Basically Homeless":(sheet.stash<=20)?"McDonalds Worker":(sheet.stash<=39)?"Small Buisness Coper":"Morshu in the Making" })

Playbook Class: ${sheet.class}
${align(`Playbook: ${renderGauge(sheet.xp.playbook)}
Insight: ${renderGauge(sheet.xp.insight)}
Hunt: ${renderGauge(sheet.xp.hunt)}
Study: ${renderGauge(sheet.xp.study)}
Survey: ${renderGauge(sheet.xp.survey)}
Tinker: ${renderGauge(sheet.xp.tinker)}
Prowess: ${renderGauge(sheet.xp.prowess)}
Finesse: ${renderGauge(sheet.xp.finesse)}
Prowl: ${renderGauge(sheet.xp.prowl)}
Skirmish: ${renderGauge(sheet.xp.skirmish)}
Wreck: ${renderGauge(sheet.xp.wreck)}
Resolve: ${renderGauge(sheet.xp.resolve)}
Attune: ${renderGauge(sheet.xp.attune)}
Command: ${renderGauge(sheet.xp.command)}
Consort: ${renderGauge(sheet.xp.consort)}
Sway: ${renderGauge(sheet.xp.sway)}`)}
\`\`\`
__Abilities:__
${sheet.abilities.length ? sheet.abilities.map(a =>{ return `**${a.name}**: ${a.info}` }).join('\n') : 'None'}

__Carrying:__
${sheet.items.length ? `${sheet.items.map(_=>_.name).join('\n')}\n**Total Load**: ${sheet.items.reduce((a,c)=>a + c.load,0)}` : 'Nothing'}

__Contacts:__
${sheet.contacts.length ? sheet.contacts.map(c => `*${c.name}, ${c.info}* ${c.favor == 0 ? '' : c.favor > 0 ? '▲' : '▼'}`).join('\n') : 'None'}
`
}

function getCurrentChar(id)
{
  if(!Characters.hasOwnProperty(id))return false;
  
  if(!Characters[id][CurrentCharacter[id]])throw new Error("Erm excuse me what the actual fuck");

  return Characters[id][CurrentCharacter[id]];
}

CommandManager.addHandler('newChar', (args,msg)=>{
  var C = getCurrentChar(msg.author.id);
  /*if(C){
    msg.channel.send('You already have a character. You must delete them before you can create another.')
    return
  }*/
  if(Characters[msg.author.id]) 
  {
    Characters[msg.author.id].push(newChar());
    CurrentCharacter[msg.author.id] = Characters[msg.author.id].length-1;
  }
  else
  {
    Characters[msg.author.id] = [newChar()];   
    CurrentCharacter[msg.author.id] = 0;
  }
  msg.channel.send('Your character has been created.\nYou will need to **set** your name and class, **inc**rement your stats and **add** any items and abilities.\n')
  saveCharData();
  return
})

CommandManager.addHandler('sheet', (args,msg)=>{
  if(!hasCharacters(msg.author.id)){
    msg.channel.send(`You need to create a character with ${Config.prefix}newChar first.`)
    return
  }
  var C = getCurrentChar(msg.author.id);
  msg.channel.send(renderChar(C))
  return
})

CommandManager.addHandler('characters', (args, msg)=>{
  if(!hasCharacters(msg.author.id))
  {
    msg.channel.send(`You have no characters currently. You can create one with ${Config.prefix}newchar first.`)
    return
  }
  var currentCharacter = CurrentCharacter[msg.author.id]
  var cNames = Characters[msg.author.id].map((sheet, index) => (index == currentCharacter) ? `**${sheet.name}**` : sheet.name);
  msg.channel.send(`Your current characters: ${cNames.join('\n')}\nTo switch your current character, use $become (character name)`) 
  return
})

CommandManager.addHandler('become', (args, msg)=> {
  if(!hasCharacters(msg.author.id))
  {
    msg.channel.send('no')
    return
  }
  args.splice(0,1);
  var name = args.join(' ');
  var newIndex = Characters[msg.author.id].findIndex(sheet => sheet.name == name);

  if(newIndex < 0)
  {
    msg.channel.send(`Could not find a character you own with the name ${name}`)
    return
  }
  
  CurrentCharacter[msg.author.id] = newIndex;
  msg.channel.send(`Updated your active character. Welcome, ${name}.`);
  fs.writeFileSync('../data/Players.json', JSON.stringify(CurrentCharacter,null,2))

  return
})

CommandManager.addHandler('stats', (args,msg)=>{
  var C = getCurrentChar(msg.author.id);
  if(!hasCharacters(msg.author.id)){
    msg.channel.send(`You must create a character with ${Config.prefix}newChar first.`)
    return
  }
  var sheet = C; //yes this is really lazy. no i don't care.
  msg.channel.send(`\`\`\`
Stress: ${renderGauge(sheet.stress)}
Trauma: ${sheet.trauma.length?sheet.trauma.join(' - '):'None'}
Harm:
lv.3| ${sheet.harm[2].length?sheet.harm[2]:'None'}
lv.2| ${sheet.harm[1].length?sheet.harm[1].join(', '):'None'}
1v.1| ${sheet.harm[0].length?sheet.harm[0].join(', '):'None'}
Healing: ${sheet.heal_clock.current}/${sheet.heal_clock.total}
Armor: Light ${CB(sheet.armor.light)} Heavy ${CB(sheet.armor.heavy)} Special ${CB(sheet.armor.special)}

Coin: ${sheet.coin}
Stash: ${sheet.stash} (${(sheet.stash <= 10)?"Basically Homeless":(sheet.stash<=20)?"McDonalds Worker":(sheet.stash<=39)?"Small Buisness Coper":"Morshu in the Making" })

Playbook Class: ${sheet.class}
${align(`Playbook: ${renderGauge(sheet.xp.playbook)}
Insight: ${renderGauge(sheet.xp.insight)}
Hunt: ${renderGauge(sheet.xp.hunt)}
Study: ${renderGauge(sheet.xp.study)}
Survey: ${renderGauge(sheet.xp.survey)}
Tinker: ${renderGauge(sheet.xp.tinker)}
Prowess: ${renderGauge(sheet.xp.prowess)}
Finesse: ${renderGauge(sheet.xp.finesse)}
Prowl: ${renderGauge(sheet.xp.prowl)}
Skirmish: ${renderGauge(sheet.xp.skirmish)}
Wreck: ${renderGauge(sheet.xp.wreck)}
Resolve: ${renderGauge(sheet.xp.resolve)}
Attune: ${renderGauge(sheet.xp.attune)}
Command: ${renderGauge(sheet.xp.command)}
Consort: ${renderGauge(sheet.xp.consort)}
Sway: ${renderGauge(sheet.xp.sway)}`)}
\`\`\``)
})

CommandManager.addHandler('set', (args,msg)=>{
  var C = getCurrentChar(msg.author.id);
  if(!hasCharacters(msg.author.id)){
    msg.channel.send(`You have not yet created a character. Do so with ${Config.prefix}newChar first.`)
    return
  }
  args.splice(0,1)
  var field = args.splice(0,1)[0].toLowerCase()
    , validFields = 'name,affiliation,heritage,background,class,crew,alias,vice,look'.split(',')
  if(!validFields.includes(field)){
    msg.channel.send(`${args[0]} is not recognized as a valid **set**-able field.`)
    return
  }
  C[field] = args.join(' ')
  msg.channel.send(`Your ${field} is now: ${args.join(' ')}`)
  saveCharData();
  return
})

CommandManager.addHandler('inc', (args,msg)=>{
  var C = getCurrentChar(msg.author.id);
  if(!hasCharacters(msg.author.id)){
    msg.channel.send(`You have not yet created a character. Do so with ${Config.prefix}newChar first.`)
    return
  }
  args.splice(0,1)
  var field = args[0].toLowerCase()
    , amt = parseInt(args[1])
  if(!amt){
    msg.channel.send(`Invalid increment amount ${args[1]}`)
    return
  }
  if(C.xp[field]){
    incGauge(C.xp[field],amt)
  }else if(['healing','stress'].includes(field)){
    if(field == 'healing'){
      incGauge(C.heal_clock,amt)
    }else{
      incGauge(C.stress,amt)
    }
  }else if(['coin','stash'].includes(field)){
    C[field] += amt
  }else{
    msg.channel.send(`Whatever you're trying to do, it sure ain't working.`)
    return
  }
  saveCharData();
  msg.channel.send(`Updated your ${Config.prefix}stats`)
  return
})

CommandManager.addHandler('add', (args,msg)=>{
  var C = getCurrentChar(msg.author.id);
  if(!hasCharacters(msg.author.id)){
    msg.channel.send(`You have not yet created a character. Do so with ${Config.prefix}newChar first.`)
    return
  }
  args.splice(0,1)
  if(!args){
    msg.channel.send(`Usage:
${Config.prefix}add ability <ability name>
${Config.prefix}add item <item name>
${Config.prefix}add harm <lvl of harm> <harm description>
${Config.prefix}add trauma <trauma>`)
    return
  }
  var field = args.splice(0,1)[0].toLowerCase()
  if(field == 'ability'){
    if(!args){
      msg.channel.send(`Usage: ${Config.prefix}add ability <ability name>`)
      return
    }
    if(!C.class){
      msg.channel.send('You must first select your class before choosing abilities.')
      return
    }
    var A = Abilities[C.class.toLowerCase()].find(_=>_.name.toLowerCase() == args.join(' ').toLowerCase());
    if(!A){
      msg.channel.send(`Could not find an ability matching ${args.join(' ')}. Check your spelling and try again.`)
      return
    }
    if(C.abilities.find(_=> _.name == A.name)){
      msg.channel.send('You already have that ability.')
      return
    }
    C.abilities.push(A)
    msg.channel.send(`Gained new ability **${A.name}**`)
    saveCharData()
    return
  }
  if(field == 'item'){
    if(!args){
      msg.channel.send(`Usage: ${Config.prefix}add item <item name>`)
      return
    }
    console.log(`${C.class}`)
    var I = Items[C.class.toLowerCase()].find(_=>_.name.toLowerCase() == args.join(' ').toLowerCase());
    console.log(I ? I : 'item is not a class item')
    if(!I){
      if(Items['standard'].find(_=>_.name.toLowerCase() == args.join(' ').toLowerCase())){
        I = Items['standard'].find(_=>_.name.toLowerCase() == args.join(' ').toLowerCase())
      }else{
        msg.channel.send(`Could not find an item matching ${args.join(' ')}. Check your spelling and try again.`)
        return
      }
    }
    console.log(I)
    if(C.items.find(_=>_.name == I.name)){
      msg.channel.send(`You already have ${I.name} equipped.`)
      return
    }
    C.items.push(I)
    msg.channel.send(`Equipped **${I.name}**`)
    saveCharData()
    return
  }
  if(field == 'harm'){
    //$add harm <lvl> <desc>
    if(!args){
      msg.channel.send(`Usage: ${Config.prefix}add harm <level of harm> <harm description>`)
      return
    }
    var lvl = parseInt(args[0])
    if(!lvl || lvl > 3 || lvl < 1){
      msg.channel.send(`Invalid harm level: ${args[0]}`)
      return
    }
    C.harm[lvl-1].push(args.slice(1).join(' '))
    msg.channel.send(`Added lvl.${lvl} harm: ${args.slice(1).join(' ')}`)
    saveCharData()
    return
  }
  if(field == 'trauma'){
    if(!args){
      msg.channel.send(`Usage: ${Config.prefix}add trauma <trauma>`)
      return
    }
    C.trauma.push(args.join(' '))
    msg.channel.send(`Added trauma ${args.join(' ')}`)
    saveCharData()
    return
  }
  if(field == 'contact'){
    if(!args || args.length < 3){
      msg.channel.send(`Usage: ${Config.prefix}add contact <favor (-1 for enemy/1 for friend)> <contact name> (EXCLUDE THE ,) <contact description>`)
      return
    }
    var favor = parseInt(args[0])
    if(!favor){
      msg.channel.send('Favor must be a valid number (and is almost always -1 or 1)')
      return
    }
    C.contacts.push({favor:favor, name:args[1], info:args.slice(2).join(' ')})
    msg.channel.send(`Added contact: ${args[1]}, ${args.slice(2).join(' ')}
(There's no way to edit these so I hope you didn't fuck this up :smile:)`)
    saveCharData()
    return
  }
})

CommandManager.addHandler('remove', (args,msg)=>{
  var C = getCurrentChar(msg.author.id);
  if(!hasCharacters(msg.author.id)){
    msg.channel.send(`You have not yet created a character. Do so with ${Config.prefix}newChar first.`)
    return
  }
  args.splice(0,1)
  if(!args){
    msg.channel.send(`Usage:
${Config.prefix}remove ability <ability name>
${Config.prefix}remove item <item name>
${Config.prefix}remove harm <lvl of harm> <harm description>
${Config.prefix}remove trauma <trauma>`)
    return
  }
  var field = args.splice(0,1)[0].toLowerCase()
  if(field == 'ability'){
    if(!args){
      msg.channel.send(`Usage: ${Config.prefix}remove ability <ability name>`)
      return
    }
    if(!hasCharacters(msg.author.id).class){
      msg.channel.send('You must first select your class before modifying abilities.')
      return
    }
    var A = C.abilities.findIndex(_=>_.name.toLowerCase() == args.join(' ').toLowerCase());
    if(A == -1){
      msg.channel.send(`You do not appear to have an ability matching ${args.join(' ')}. Check your spelling and try again.`)
      return
    }
    C.abilities.splice(A,1)
    msg.channel.send(`Removed ability **${args.join(' ')}**`)
    saveCharData()
    return
  }
  if(field == 'item'){
    if(!args){
      msg.channel.send(`Usage: ${Config.prefix}remove item <item name>`)
      return
    }
    console.log(`${C.class}`)
    var I = C.items.findIndex(_=>_.name.toLowerCase() == args.join(' ').toLowerCase());
    if(I == -1){
        msg.channel.send(`Could not find an item in your inventory matching ${args.join(' ')}. Check your spelling and try again.`)
        return
    }
    C.items.splice(I,1)
    msg.channel.send(`Unequipped **${args.join(' ')}**`)
    saveCharData()
    return
  }
  if(field == 'harm'){
    //$remove harm <lvl> <desc>
    if(!args){
      msg.channel.send(`Usage: ${Config.prefix}remove harm <level of harm> <harm description>`)
      return
    }
    var lvl = parseInt(args[0])
    if(!lvl || lvl > 3 || lvl < 1){
      msg.channel.send(`Invalid harm level: ${args[0]}`)
      return
    }
    var i = C.harm[lvl-1].findIndex(_=> _ == args.slice(1).join(' '))
    if(i == -1){
      msg.channel.send(`You do not appear to have a lvl.${lvl} harm "${args.slice(1).join(' ')}"`)
      return
    }
    C.harm[lvl-1].splice(i,1)
    msg.channel.send(`Removed lvl.${lvl} harm: ${args.slice(1).join(' ')}`)
    saveCharData()
    return
  }
  if(field == 'trauma'){
    msg.channel.send('Trauma is permanent.')
    return
  }
})

CommandManager.addHandler('renderTest', (args,msg)=>{
  msg.channel.send(renderChar(newChar()))
})

//CommandManager.addHandler('items')
CommandManager.addHandler('items', (args,msg)=>{
  var C = getCurrentChar(msg.author.id)

  msg.channel.send(`${C ? `**__Class Specific:__**\n${Items[C.class.toLowerCase()].map(_=>`${_.name} ${_.amount ? `Uses: ${_.amount} ` : ''}${'⭘'.repeat(_.load)}${_.limit ? ` (up to ${'⭘'.repeat(_.limit)})` : ''}`).join('\n')}\n` : ''}**__Standard:__**\n${Items.standard.map(_=>`${_.name} ${_.amount ? `Uses: ${_.amount} ` : ''}${'⭘'.repeat(_.load)}${_.limit ? ` (up to ${'⭘'.repeat(_.limit)})` : ''}`).join('\n')}`)
})

CommandManager.addHandler('abilities', (args,msg)=>{
  if(args.length != 2){
    msg.channel.send(`Usage: ${Config.prefix}abilities <class/playbook name>`)
    return
  }
  var className = args.splice(0,2)[1].toLowerCase()
  if(!Abilities[className]){
    msg.channel.send(`Could not find data for class "${className}"`)
    return
  }
  msg.channel.send(Abilities[className].map(_=>`**${_.name}**: ${_.info}`).join('\n'))
})

CommandManager.addHandler('wallet', (args, msg)=> {
    var C = getCurrentChar(msg.author.id)
    if(!hasCharacters(msg.author.id)){
		msg.channel.send(`You ain't even got a character yet, fuck you mean wallet?`)
		return
	}
	
	
	    
    msg.channel.send(`You got ${C.coin} coin stashed around the place.${(C.coin > 0)?" Pray you don't get robbed.":""}\nYou have ${C.stash} coin stashed away safely. That means you ${(C.stash <= 10)?"are Basically Homeless":(C.stash<=20)?"a McDonalds Worker":(C.stash<=39)?"a Small Buisness Coper":"a Morshu in the Making" }`)
	return
});
