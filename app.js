const fs = require("fs")
const { parseOBJ } = require("./parser.js")

parseOBJ(fs.createReadStream("model.obj"), function(err, result) {
  if(err) {
    throw new Error("Error parsing OBJ file: " + err)
  }
  console.log("Got mesh: ", result)
})
