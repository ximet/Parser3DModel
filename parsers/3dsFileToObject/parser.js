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
  const returnObjectsOption = true;
  const returnTreeOption = false;

  var result = {}

  var rootChunk = parseChunk(buffer, 0);

  if (returnObjectsOption) {
    result.objects = getResultChunks(rootChunk);
  }

  if (returnTreeOption) {
    result.tree = rootChunk;
  }

  return result;
};

module.exports = {
  parse3ds
}
