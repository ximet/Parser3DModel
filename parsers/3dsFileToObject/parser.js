const { NON_LEAF_CHUNKS } = require('./enums/nonLeafChunk.js');
const { CHUNK_NAMES } = require('./enums/chunkNames.js');
const { getResultChunks } = require('./helpers/chunkHelper.js');
const { parseObjectChunk,
        parseVertexListChunk,
        parseFaceListChunk,
        parseMaterialNameChunk,
        CHUNK_PARSERS,
        parseChunk,
        encoding  } = require('./helpers/parseHelper.js');


const parse3ds = (buffer) => {
  // const returnObjectsOption = true;
  // const returnTreeOption = false;

  var rootChunk = parseChunk(buffer, 0);

  const chunkObjects = getResultChunks(rootChunk);
  // const treeChunk = returnTreeOption ? rootChunk : null


  return {
      chunkObjects,
      // treeChunk
  };
};

module.exports = {
  parse3ds
}
