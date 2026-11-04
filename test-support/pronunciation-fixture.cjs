function box(type, payload) {
  const header = Buffer.alloc(8);
  header.writeUInt32BE(payload.length + 8, 0);
  header.write(type, 4, 4, "ascii");
  return Buffer.concat([header, payload]);
}
function pronunciationFixture() {
  const mvhd = Buffer.alloc(20);
  mvhd.writeUInt32BE(1000, 12);
  mvhd.writeUInt32BE(1000, 16);
  const entry = Buffer.concat([
    Buffer.alloc(28),
    box("esds", Buffer.from([0, 0, 0, 0, 4, 1, 0x40, 0])),
  ]);
  const stsd = Buffer.concat([Buffer.from([0, 0, 0, 0, 0, 0, 0, 1]), box("mp4a", entry)]);
  const track = box("trak", box("mdia", box("minf", box("stbl", box("stsd", stsd)))));
  return new Uint8Array(
    Buffer.concat([
      box("ftyp", Buffer.alloc(8)),
      box("mdat", Buffer.alloc(1)),
      box("moov", Buffer.concat([box("mvhd", mvhd), track])),
    ]),
  );
}
module.exports = { pronunciationFixture };
