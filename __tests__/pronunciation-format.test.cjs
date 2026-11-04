const {
  decodeAudio,
  encodeAudio,
  recordedAudioDuration,
  validateAudio,
} = require("../src/platform/pronunciation-format");
const { validateBackup } = require("../src/platform/backup");

const { pronunciationFixture: sample } = require("../test-support/pronunciation-fixture.cjs");

test("checks bounded audio and canonical encoding", () => {
  const bytes = sample();
  expect(validateAudio(bytes, 1000)).toBe(1000);
  expect(recordedAudioDuration(bytes)).toBe(1000);
  expect(decodeAudio(encodeAudio(bytes))).toEqual(bytes);
  expect(() => validateAudio(bytes, 7000)).toThrow();
  expect(() => decodeAudio("AB==")).toThrow();
  expect(() => validateAudio(bytes.subarray(0, bytes.length - 1), 1000)).toThrow();
  const wrongCodec = bytes.slice();
  const descriptor = Buffer.from(wrongCodec).indexOf(Buffer.from([4, 1, 0x40]));
  wrongCodec[descriptor + 2] = 0x20;
  expect(() => validateAudio(wrongCodec, 1000)).toThrow();
});

test("accepts an extended-size media box and rejects an oversized box", () => {
  const original = Buffer.from(sample());
  const mediaStart = 16;
  const extended = Buffer.concat([
    original.subarray(0, mediaStart),
    Buffer.from([0, 0, 0, 1, 109, 100, 97, 116, 0, 0, 0, 0, 0, 0, 0, 17, 0]),
    original.subarray(mediaStart + 9),
  ]);
  expect(validateAudio(extended, 1000)).toBe(1000);
  extended.writeUInt32BE(1, mediaStart + 8);
  expect(() => validateAudio(extended, 1000)).toThrow();
});

test("version 2 requires unique, collection-scoped valid audio", () => {
  const timestamp = "2026-10-29T12:00:00.000Z";
  const clip = { collectionId: 1, termId: 1, durationMs: 1000, audioBase64: encodeAudio(sample()) };
  const backup = {
    format: "vocabulaire",
    schemaVersion: 2,
    exportedAt: timestamp,
    data: {
      collections: [
        {
          id: 1,
          name: "French",
          shortLabel: null,
          icon: "📚",
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
      terms: [
        {
          id: 1,
          collectionId: 1,
          original: "mot",
          translation: "word",
          notes: "",
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
      categories: [],
      termCategories: [],
      savedFilters: [],
      savedFilterCategories: [],
      dailyPicks: [],
      preferences: [],
      termAudio: [clip],
    },
  };
  expect(validateBackup(backup)).toEqual(backup);
  expect(() =>
    validateBackup({ ...backup, data: { ...backup.data, termAudio: [clip, clip] } }),
  ).toThrow();
  expect(() =>
    validateBackup({
      ...backup,
      data: { ...backup.data, termAudio: [{ ...clip, collectionId: 2 }] },
    }),
  ).toThrow();
});
