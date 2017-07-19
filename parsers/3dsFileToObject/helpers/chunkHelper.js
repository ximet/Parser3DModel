function get3TypeChunks (objectChunks)  {
  return objectChunks.map(function(objectChunk) {
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



const getResultChunks = (rootChunk) => {
  var editorChunk = getChildChunk(rootChunk, 0x3D3D);
  var objectChunks = getChildrenChunks(editorChunk, 0x4000);

  return get3TypeChunks(objectChunks);
}

module.exports = {
  getResultChunks
}
