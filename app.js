const fs = require('fs');
const { parseObjFile } = require('./parsers/ObjFileToArray/index.js');
const { parse3dsFile } = require('./parsers/3dsFileToObject/index.js');


console.log(parse3dsFile())
