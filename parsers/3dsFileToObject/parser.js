const { CHUNK_NAMES } = require('./enums/chunkNames.js');
const { NON_LEAF_CHUNKS } = require('./enums/nonLeafChunk.js');
const CHUNK_PARSERS = {
  0x4000: parseObjectChunk,
  0x4110: parseVertexListChunk,
  0x4120: parseFaceListChunk,
  0xA000: parseMaterialNameChunk
};

let encoding;


function parseMaterialNameChunk(buf) {
    return {
      materialName: fromASCIIZ(buf)
    };
}


function parseFaceListChunk(buf) {
    const faceCount = buf.readUInt16LE(0);
    const data = buf.slice(2);
    const faces = [];

    for (let i=0; i<faceCount; i++) {
      const off = i * 2 * 4;

      faces.push(data.slice(off, off + 2 * 3));
    }

    return {
      faceCount: faceCount,
      faces: Buffer.concat(faces)
    };
}


function parseVertexListChunk(buf) {
    return {
      vertexCount: buf.readUInt16LE(0),
      vertices: buf.slice(2)
    };
}

function fromASCIIZ(buf, obj) {
    let i = 0;
    while(buf[i] != 0) {
        i++;
    }

    if (obj) {
        obj.count = i;
    }

    return buf.slice(0, i).toString(encoding);
}


function parseObjectChunk(buf) {
  const  obj= {}
  const data = buf.slice(obj.count + 1);

  return {
    objectName: fromASCIIZ(buf, obj),
    children: parseChildren(data)
  };
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


function parseChunk(buf, offset) {
  const chunkId = buf.readUInt16LE(offset);
  const chunkLength = buf.readUInt32LE(offset + 2);
  const data = buf.slice(offset + 6, offset + chunkLength);
  const chunkName = CHUNK_NAMES[chunkId] || 'Unknown';

  let chunk = {
    id: chunkId,
    name: chunkName,
    length: chunkLength
  };

  /*
   * If a parser is defined for this chunkId, use it.
   * Else if the chunk is known as non-leaf, try to parse it as a list of children chunks
   */
  if(CHUNK_PARSERS[chunk.id]) {
    const parsed = CHUNK_PARSERS[chunk.id](data);

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
  const chunks = getChildrenChunks(tree, id);

  return chunks.length > 0
    ? getChildrenChunks(tree, id)[0]
    : null;
}


function getChildrenChunks(tree, id) {
  return tree.children.filter(function(chunk) {
    return chunk.id === id;
  });
}


function unpackVertices(buf) {
  const vertexCount = buf.length / (3 * 4);
  const vertices = [];

  for(let i=0; i<vertexCount; i++) {
    const off = i * 3 * 4;

    vertices.push([
      buf.readFloatLE(off + (0 * 4)),
      buf.readFloatLE(off + (1 * 4)),
      buf.readFloatLE(off + (2 * 4)),
      ]);
  }

  return vertices;
}


function unpackFaces(buf) {
  const faceCount = buf.length / (3 * 2);
  const faces = [];

  for(var i=0; i<faceCount; i++) {
    const off = i * 3 * 2;

    faces.push([
      buf.readUInt16LE(off + (0 * 2)),
      buf.readUInt16LE(off + (1 * 2)),
      buf.readUInt16LE(off + (2 * 2)),
      ]);
  }

  return faces;
}

const parse3ds = (buf, opts) => {
  opts = opts || { 'objects':true, 'tree':true }
  const returnObjects = opts.objects == undefined ? true : opts.objects;
  const returnTree = opts.tree == undefined ? false : opts.tree;
  encoding = opts.encoding == undefined ? 'binary' : opts.encoding;

  const result = {}

  const rootChunk = parseChunk(buf, 0);

  if (returnObjects) {
    const editorChunk = getChildChunk(rootChunk, 0x3D3D);
    const objectChunks = getChildrenChunks(editorChunk, 0x4000);

    result.objects = get3TypeChunks(objectChunks);
  }

  if (returnTree) {
    result.tree = rootChunk;
  }

  return result;
};

const get3TypeChunks = (objectChunks) => {
  const triangularMesh = 0x4100;
  const vertexList = 0x4110;
  const faceList = 0x4120;

  return objectChunks.map(function(objectChunk) {
    const triMeshChunk = getChildChunk(objectChunk, triangularMesh);
    const vertexListChunk = getChildChunk(triMeshChunk, vertexList);
    const faceListChunk = getChildChunk(triMeshChunk, faceList);

    return {
      name: objectChunk.objectName,
      vertices: unpackVertices(vertexListChunk.vertices),
      faces: unpackFaces(faceListChunk.faces)
    };
  });
}


module.exports = {
    parse3ds
}
