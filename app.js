const fs = require("fs")
const { parseOBJ } = require("./parser.js")

parseOBJ(fs.createReadStream("model.obj"), function(err, result) {
    if(err) {
      throw new Error("Error parsing OBJ file: " + err)
    }

    console.log(result);
    const wstream = fs.createWriteStream('output.txt');
    wstream.write(JSON.stringify(result));
    wstream.end();
})
