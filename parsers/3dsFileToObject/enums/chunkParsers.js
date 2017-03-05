const CHUNK_PARSERS = {
  0x4000: parseObjectChunk,
  0x4110: parseVertexListChunk,
  0x4120: parseFaceListChunk,
  0xA000: parseMaterialNameChunk
};

module.exports = {
  CHUNK_PARSERS
}
