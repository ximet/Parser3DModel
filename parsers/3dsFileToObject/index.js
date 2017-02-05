const fs = require('fs');
const path = require('path');
const { parse3ds } = require('./parser.js');

var filename = "donut.3ds"; //FIXME after delete test file
var filePath = path.resolve(path.join(__dirname, "", filename));

const parse3dsFile = () => {
    const buffer = fs.readFileSync(filePath);

    return parse3ds(buffer);
}

module.exports = {
    parse3dsFile
};
