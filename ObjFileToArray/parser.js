const split = require("split")

const parseOBJ = (stream, cb) => {
  const vertexPositions = [];
  const vertexNormals = [];
  const vertexTexture = [];
  const facePositions = [];
  const faceNormals = [];
  const faceTexture = [];
  stream.pipe(split())
    .on("data", function(line) {
      if(line.length === 0 || line.charAt(0) === "#") {
        return;
      }
      const toks = line.split(" ");

      switch(toks[0]) {
          case "v": {
              if(toks.length < 3) {
                throw new Error(`parse-obj: Invalid vertex : ${line}`);
              }

              vertexPositions.push(Number(toks[1]), Number(toks[2]), Number(toks[3]));
              break;
          }

          case "vn": {
              if(toks.length < 3) {
                throw new Error(`parse-obj: Invalid vertex normal: ${line}`);
              }

              vertexNormals.push(Number(toks[1]), Number(toks[2]), Number(toks[3]));
              break;
          }

          case "vt": {
              if(toks.length < 2) {
                throw new Error(`parse-obj: Invalid vertex texture coord: ${line}`);
              }

              vertexTexture.push(Number(toks[1]), Number(toks[2]));
              break;
          }

          case "f": {
              const position = new Array(toks.length-1);
              const normal = new Array(toks.length-1);
              const texCoord = new Array(toks.length-1);

              for (let i = 1; i < toks.length; ++i) {
                const indices = toks[i].split("/");
                position[i - 1] = (indices[0] | 0) - 1;
                texCoord[i - 1] = indices[1] ? (indices[1] | 0) -1 : -1;
                normal[i - 1] = indices[2] ? (indices[2] | 0) -1 : -1;
              }

              facePositions.push(position);
              faceNormals.push(normal);
              faceTexture.push(texCoord);
              break;
          }


          case "vp":
          case "s":
          case "o":
          case "g":
          case "usemtl":
          case "mtllib":
              break;

          default: {
              throw new Error(`parse-obj: Unrecognized directive: ${toks[0]} `);
          }
      }
    })
    .on("error", function(err) {
      cb(err, null);
    })
    .on("end", function() {
      cb(null, {
        vertexPositions: vertexPositions,
        vertexNormals: vertexNormals,
        vertexUVs: vertexTexture,
        facePositions: facePositions,
        faceNormals: faceNormals,
        faceUVs: faceTexture
      });
    })
}

module.exports = {
  parseOBJ
}
