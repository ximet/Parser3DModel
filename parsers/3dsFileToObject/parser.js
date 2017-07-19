const { NON_LEAF_CHUNKS } = require('./enums/nonLeafChunk.js');
const { CHUNK_NAMES } = require('./enums/chunkNames.js');
const { parseObjectChunk,
        parseVertexListChunk,
        parseFaceListChunk,
        parseMaterialNameChunk,
        CHUNK_PARSERS  } = require('./helpers/parseHelper.js');

var encoding;


function parseChildren(buf) {
  var offset = 0;
  var children = [];

  while(offset < buf.length) {
    var chunk = parseChunk(buf, offset);
    children.push(chunk);
    offset += chunk.length;
  }

  return children;
}


function parseChunk(buf, offset) {
  var chunkId = buf.readUInt16LE(offset);
  var chunkLength = buf.readUInt32LE(offset + 2);
  var data = buf.slice(offset + 6, offset + chunkLength);

  var chunkName = CHUNK_NAMES[chunkId] || 'Unknown';

  var chunk = {
    id: chunkId,
    name: chunkName,
    length: chunkLength
  };

  /*
   * If a parser is defined for this chunkId, use it.
   * Else if the chunk is known as non-leaf, try to parse it as a list of children chunks
   */
  if(CHUNK_PARSERS[chunk.id]) {
    var parsed = CHUNK_PARSERS[chunk.id](data);
    chunk = Object.assign({}, chunk, parsed);
  } else if(NON_LEAF_CHUNKS.indexOf(chunk.id) !== -1) {
    chunk.children = parseChildren(data);
  } else {
    // Keep raw data if unparsed node has no children
    chunk.data = data;
  }

  return chunk;
}


function getChildChunk(tree, id) {
  var chunks = getChildrenChunks(tree, id);
  return chunks.length > 0
    ? chunks[0]
    : null;
}


function getChildrenChunks(tree, id) {
  return tree.children.filter(function(chunk) {
    return chunk.id === id;
  });
}


function unpackVertices(buf) {
  var vertexCount = buf.length / (3 * 4);
  var vertices = [];

  for(var i=0; i<vertexCount; i++) {
    var off = i * 3 * 4;
    vertices.push([
      buf.readFloatLE(off + (0 * 4)),
      buf.readFloatLE(off + (1 * 4)),
      buf.readFloatLE(off + (2 * 4)),
      ]);
  }

  return vertices;
}


function unpackFaces(buf) {
  var faceCount = buf.length / (3 * 2);
  var faces = [];

  for(var i=0; i<faceCount; i++) {
    var off = i * 3 * 2;
    faces.push([
      buf.readUInt16LE(off + (0 * 2)),
      buf.readUInt16LE(off + (1 * 2)),
      buf.readUInt16LE(off + (2 * 2)),
      ]);
  }

  return faces;
}


function parse3ds(buf, opts) {

  // Default is: return objects, do not return chuncks tree
  opts = opts || {}
  var returnObjects = opts.objects == undefined ? true : opts.objects;
  var returnTree = opts.tree == undefined ? false : opts.tree;
  encoding = opts.encoding == undefined ? 'binary' : opts.encoding;

  var result = {}

  var rootChunk = parseChunk(buf, 0);

  if (returnObjects) {
    var editorChunk = getChildChunk(rootChunk, 0x3D3D);
    var objectChunks = getChildrenChunks(editorChunk, 0x4000);

    result.objects = objectChunks.map(function(objectChunk) {
      var triMeshChunk = getChildChunk(objectChunk, 0x4100);
      var vertexListChunk = getChildChunk(triMeshChunk, 0x4110);
      var faceListChunk = getChildChunk(triMeshChunk, 0x4120);

      return {
        name: objectChunk.objectName,
        vertices: unpackVertices(vertexListChunk.vertices),
        faces: unpackFaces(faceListChunk.faces)
      };
    });
  }

  if (returnTree) {
    result.tree = rootChunk;
  }

  return result;
};

module.exports = {
  parse3ds
}
