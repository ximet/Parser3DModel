const encoding = 'binary';
const { CHUNK_NAMES } = require('../enums/chunkNames.js');
const { NON_LEAF_CHUNKS } = require('../enums/nonLeafChunk.js');

const CHUNK_PARSERS = {
  0x4000: parseObjectChunk,
  0x4110: parseVertexListChunk,
  0x4120: parseFaceListChunk,
  0xA000: parseMaterialNameChunk
};

function parseObjectChunk(buf) {
  // The object chunk starts with the object name
  // as a zero terminated ASCII string
  var  obj= {}
  var objectName = fromASCIIZ(buf, obj);
  var data = buf.slice(obj.count + 1);

  return {
    objectName: objectName,
    children: parseChildren(data)
  };
}

function parseVertexListChunk(buf) {
  var vertexCount = buf.readUInt16LE(0);
  var vertices = buf.slice(2);

  // The vertice coordinates are returned as a Float32LE buffer
  return {
    vertexCount: vertexCount,
    vertices: vertices
  };
}

function parseFaceListChunk(buf) {
  var faceCount = buf.readUInt16LE(0);

  // The face array contains 3 vertex indices + a 2 bytes
  // bit-field containing various flags (see [1]).
  // The flags don't look very useful for now, so let's remove them
  // and return a directly usable buffer instead.

  var data = buf.slice(2);
  var faces = [];

  for(var i=0; i<faceCount; i++) {
    var off = i * 2 * 4;
    faces.push(data.slice(off, off + 2 * 3));
  }

  // The face indices are returned as an UInt16LE buffer
  return {
    faceCount: faceCount,
    faces: Buffer.concat(faces)
  };
}

function parseMaterialNameChunk(buf) {
  return {
    materialName: fromASCIIZ(buf)
  };
}

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

function fromASCIIZ(buf, obj) {
  var i = 0;
  while(buf[i] != 0) {
    i++;
  }

  if (obj) {
    obj.count = i;
  }

  return buf.slice(0, i).toString(encoding);
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

module.exports = {
  parseObjectChunk,
  parseVertexListChunk,
  parseFaceListChunk,
  parseMaterialNameChunk,
  CHUNK_PARSERS,
  parseChunk,
  encoding
}
