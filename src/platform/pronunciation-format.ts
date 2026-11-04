const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function encodeAudio(bytes: Uint8Array): string {
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = bytes[i + 1];
    const c = bytes[i + 2];
    result += alphabet[a >> 2] + alphabet[((a & 3) << 4) | ((b ?? 0) >> 4)];
    result += b === undefined ? '=' : alphabet[((b & 15) << 2) | ((c ?? 0) >> 6)];
    result += c === undefined ? '=' : alphabet[c & 63];
  }
  return result;
}

export function decodeAudio(value: string): Uint8Array {
  if (
    value.length > Math.ceil(131072 / 3) * 4 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)
  )
    throw new Error('Invalid audio encoding');
  const bytes: number[] = [];
  for (let i = 0; i < value.length; i += 4) {
    const a = alphabet.indexOf(value[i]);
    const b = alphabet.indexOf(value[i + 1]);
    const c = alphabet.indexOf(value[i + 2]);
    const d = alphabet.indexOf(value[i + 3]);
    bytes.push((a << 2) | (b >> 4));
    if (c >= 0) bytes.push(((b & 15) << 4) | (c >> 2));
    if (d >= 0) bytes.push(((c & 3) << 6) | d);
  }
  const result = new Uint8Array(bytes);
  if (!result.length || result.length > 131072 || encodeAudio(result) !== value)
    throw new Error('Invalid audio encoding');
  return result;
}

/** Validate the bounded MPEG-4 container and its AAC audio track. */
export function validateAudio(bytes: Uint8Array, durationMs: number): number {
  if (
    !Number.isInteger(durationMs) ||
    durationMs <= 0 ||
    durationMs > 7000 ||
    bytes.length > 131072
  )
    throw new Error('Invalid audio duration or size');
  return readAudioDuration(bytes, durationMs);
}

/** Read a freshly recorded clip's duration from its container, without wall-clock timing. */
export function recordedAudioDuration(bytes: Uint8Array): number {
  if (bytes.length > 131072) throw new Error('Invalid audio duration or size');
  return readAudioDuration(bytes);
}

function readAudioDuration(bytes: Uint8Array, expectedDurationMs?: number): number {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let hasFile = false,
    hasMedia = false,
    hasMovie = false,
    hasAac = false,
    mediaDuration = 0;
  function boxes(start: number, end: number, depth: number) {
    if (depth > 8) throw new Error('Invalid audio container');
    for (let pos = start; pos < end;) {
      if (end - pos < 8) throw new Error('Invalid audio container');
      let size = view.getUint32(pos);
      let header = 8;
      if (size === 1) {
        if (end - pos < 16 || view.getUint32(pos + 8) !== 0)
          throw new Error('Invalid audio container');
        size = view.getUint32(pos + 12);
        header = 16;
      } else if (size === 0) {
        size = end - pos;
      }
      if (size < header || size > end - pos) throw new Error('Invalid audio container');
      const type = String.fromCharCode(...bytes.subarray(pos + 4, pos + 8));
      if (depth === 0 && type === 'ftyp') hasFile = size >= header + 8;
      if (depth === 0 && type === 'mdat') hasMedia = size > header;
      if (depth === 0 && type === 'moov') hasMovie = true;
      if (type === 'mvhd') {
        const version = bytes[pos + header];
        if (version !== 0 || size < header + 20) throw new Error('Unsupported audio duration');
        const scale = view.getUint32(pos + header + 12),
          duration = view.getUint32(pos + header + 16);
        if (!scale) throw new Error('Invalid audio duration');
        mediaDuration = (duration * 1000) / scale;
      }
      if (type === 'stsd') {
        if (size < header + 16) throw new Error('Invalid audio track');
        const entries = view.getUint32(pos + header + 4);
        let entry = pos + header + 8;
        for (let i = 0; i < entries; i++) {
          if (entry + 8 > pos + size) throw new Error('Invalid audio track');
          const entrySize = view.getUint32(entry);
          if (entrySize < 8 || entry + entrySize > pos + size)
            throw new Error('Invalid audio track');
          if (String.fromCharCode(...bytes.subarray(entry + 4, entry + 8)) === 'mp4a') {
            if (entrySize < 36) throw new Error('Invalid audio track');
            for (let child = entry + 36; child < entry + entrySize;) {
              if (child + 8 > entry + entrySize) throw new Error('Invalid audio track');
              const childSize = view.getUint32(child);
              if (childSize < 8 || child + childSize > entry + entrySize)
                throw new Error('Invalid audio track');
              const childType = String.fromCharCode(...bytes.subarray(child + 4, child + 8));
              if (childType === 'esds' && childSize >= 16) {
                for (
                  let descriptor = child + 12;
                  descriptor + 2 < child + childSize;
                  descriptor++
                ) {
                  if (bytes[descriptor] !== 4) continue;
                  let lengthEnd = descriptor + 1;
                  while (lengthEnd < child + childSize && (bytes[lengthEnd] & 128) !== 0)
                    lengthEnd++;
                  if (lengthEnd + 1 < child + childSize && bytes[lengthEnd + 1] === 0x40)
                    hasAac = true;
                }
              }
              child += childSize;
            }
          }
          entry += entrySize;
        }
      }
      if (['moov', 'trak', 'mdia', 'minf', 'stbl'].includes(type))
        boxes(pos + header, pos + size, depth + 1);
      pos += size;
    }
  }
  boxes(0, bytes.length, 0);
  if (
    !hasFile ||
    !hasMedia ||
    !hasMovie ||
    !hasAac ||
    mediaDuration <= 0 ||
    mediaDuration > 7200 ||
    (expectedDurationMs !== undefined && Math.abs(mediaDuration - expectedDurationMs) > 250)
  )
    throw new Error('Invalid pronunciation audio');
  return Math.min(7000, Math.round(mediaDuration));
}
