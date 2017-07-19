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


function parse3ds(buf, opts) {

  // Default is: return objects, do not return chuncks tree
  opts = opts || {}
  var returnObjects = opts.objects == undefined ? true : opts.objects;
  var returnTree = opts.tree == undefined ? false : opts.tree;

  var result = {}

  var rootChunk = parseChunk(buf, 0);

  if (returnObjects) {
    result.objects = getResultChunks(rootChunk);
  }

  if (returnTree) {
    result.tree = rootChunk;
  }

  return result;
};

module.exports = {
  parse3ds
}
