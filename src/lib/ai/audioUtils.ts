const ALLOWED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.webm', '.ogg', '.flac', '.aac', '.mp4'];
const ALLOWED_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/m4a',
  'audio/x-m4a',
  'audio/webm',
  'audio/ogg',
  'audio/flac',
  'audio/aac',
  'video/mp4',
  'video/webm',
];

export interface AudioValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates audio file extension and MIME type.
 */
export function validateAudioFormat(fileName: string, mimeType?: string): AudioValidationResult {
  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

  if (!ALLOWED_AUDIO_EXTENSIONS.includes(ext)) {
    return {
      isValid: false,
      error: `Unsupported audio format "${ext}". Allowed formats are: ${ALLOWED_AUDIO_EXTENSIONS.join(', ')}`,
    };
  }

  if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType) && !mimeType.startsWith('audio/') && !mimeType.startsWith('video/')) {
    return {
      isValid: false,
      error: `Unsupported MIME type "${mimeType}". Please upload a valid audio or video file.`,
    };
  }

  return { isValid: true };
}

/**
 * Chunks a large audio Buffer if it exceeds maxChunkSizeBytes (e.g. 20 MB).
 */
export function chunkAudioBuffer(buffer: Buffer, maxChunkSizeBytes = 20 * 1024 * 1024): Buffer[] {
  if (buffer.length <= maxChunkSizeBytes) {
    return [buffer];
  }

  console.log(`[Audio Chunker] Audio size (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds limit. Chunking into smaller segments...`);

  const chunks: Buffer[] = [];
  let offset = 0;

  while (offset < buffer.length) {
    const chunkSize = Math.min(maxChunkSizeBytes, buffer.length - offset);
    chunks.push(buffer.subarray(offset, offset + chunkSize));
    offset += chunkSize;
  }

  console.log(`[Audio Chunker] Created ${chunks.length} audio chunks for sequential transcription.`);
  return chunks;
}

/**
 * Retries an async function with exponential backoff for resilience against rate limits or temporary API outages.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelayMs = 1000
): Promise<T> {
  let attempt = 0;
  let delay = initialDelayMs;

  while (true) {
    try {
      attempt++;
      return await fn();
    } catch (err: any) {
      if (attempt > maxRetries) {
        console.error(`[API Retry] Failed after ${maxRetries} attempts:`, err.message);
        throw err;
      }

      console.warn(`[API Retry] Attempt ${attempt} failed: ${err.message}. Retrying in ${delay}ms...`);
      await new Promise((res) => setTimeout(res, delay));
      delay *= 2; // Exponential backoff multiplier
    }
  }
}
