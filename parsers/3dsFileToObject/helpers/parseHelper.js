const encoding = 'binary';
const { CHUNK_NAMES } = require('../enums/chunkNames.js');
const { NON_LEAF_CHUNKS } = require('../enums/nonLeafChunk.js');

const CHUNK_PARSERS = {
  0x4000: parseObjectChunk,
  0x4110: parseVertexListChunk,
  0x4120: parseFaceListChunk,
  0xA000: parseMaterialNameChunk
};

function fromASCIICode(buf, obj) {
  let count = null;
  let i = 0;

  while(buf[i] !== 0) {
    i++;
  }

  if (obj) {
    count = i;
  }

  return {
    objectName: buf.slice(0, i).toString(encoding),
    count
  }
}

function parseChildren(buf) {
  let offset = 0;
  const children = [];

  while(offset < buf.length) {
    const chunk = parseChunk(buf, offset);
    children.push(chunk);
    offset += chunk.length;
  }

  return children;
}

function parseObjectChunk(buf) {
  const { objectName, count } = fromASCIICode(buf, {});
  const data = buf.slice(count + 1);

  return {
    objectName,
    children: parseChildren(data)
  };
}

function parseVertexListChunk(buf) {
  const vertexCount = buf.readUInt16LE(0);
  const vertices = buf.slice(2);

  // The vertice coordinates are returned as a Float32LE buffer
  return {
    vertexCount: vertexCount,
    vertices: vertices
  };
}

function parseFaceListChunk(buf) {
  const faceCount = buf.readUInt16LE(0);
  const data = buf.slice(2);
  const faces = [];

  for(let i=0; i < faceCount; i++) {
    const off = i * 2 * 4;
    faces.push(data.slice(off, off + 2 * 3));
  }

  return {
    faceCount: faceCount,
    faces: Buffer.concat(faces)
  };
}

function parseMaterialNameChunk(buf) {
  const { materialName } = fromASCIICode(buf);

  return {
    materialName
  };
}

const parseChunk = (buf, offset) => {
  const chunkId = buf.readUInt16LE(offset);
  const chunkLength = buf.readUInt32LE(offset + 2);
  const data = buf.slice(offset + 6, offset + chunkLength);

  const chunkName = CHUNK_NAMES[chunkId] || 'Unknown';

  let chunk = {
    id: chunkId,
    name: chunkName,
    length: chunkLength
  };


  if(CHUNK_PARSERS[chunk.id]) {
    const parsed = CHUNK_PARSERS[chunk.id](data);
    chunk = Object.assign({}, chunk, parsed);
  } else if(NON_LEAF_CHUNKS.indexOf(chunk.id) !== -1) {
    chunk.children = parseChildren(data);
  } else {
    chunk.data = data;
  }

  return chunk;
}

module.exports = {
  parseChunk
}
