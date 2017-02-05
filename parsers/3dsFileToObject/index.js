const fs = require('fs');
const { parse3ds } = require('./parser.js');

const parse3dsFile = () => {
    const buffer = fs.readFileSync('test.3ds');

    return parse3ds(buffer);
}

module.exports = {
    parse3dsFile
};
