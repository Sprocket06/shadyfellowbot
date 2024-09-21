var characters = require('./handlers/characters.json');
var players = require('./data/Players.json');
const fs = require('fs');

var ids = Object.keys(characters);
console.log(ids);

ids.forEach(id => {
	if(Array.isArray(characters[id]))return;
	players[id] = 0;
	characters[id] = [characters[id]];
});

fs.writeFileSync('./handlers/characters.json', JSON.stringify(characters,null,2));
fs.writeFileSync('./data/Players.json', JSON.stringify(players,null,2));

