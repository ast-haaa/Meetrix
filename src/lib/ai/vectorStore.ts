export interface VectorDocument {
  id: string;
  type: 'UTTERANCE' | 'DECISION' | 'ACTION_ITEM';
  content: string;
  meetingId: string;
  meetingTitle: string;
  date: string;
  speakerName?: string;
  timestamp?: string; // e.g. "0:26s"
  embedding?: number[];
}

export interface SearchResult {
  doc: VectorDocument;
  similarityScore: number;
}

/**
 * Calculates cosine similarity between two vector embedding arrays.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Generates vector embedding via OpenAI text-embedding-3-small API or local semantic vectorizer.
 */
export async function generateTextEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.data[0].embedding;
      }
    } catch (e) {
      console.warn('[Vector Engine] Live embedding API fallback:', e);
    }
  }

  // Local semantic hashing vectorizer (512 dimensions) for zero-dependency offline fallback
  const dimensions = 128;
  const vector = new Array(dimensions).fill(0);
  const words = text.toLowerCase().split(/\s+/);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = (hash << 5) - hash + word.charCodeAt(c);
      hash |= 0;
    }

    const idx = Math.abs(hash) % dimensions;
    vector[idx] += 1;
  }

  // Normalize vector
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return norm > 0 ? vector.map((v) => v / norm) : vector;
}

/**
 * Performs Semantic Vector Search across the Meeting Knowledge Store.
 */
export async function searchMeetingKnowledgeStore(
  query: string,
  knowledgeDocs: VectorDocument[],
  topK = 4
): Promise<SearchResult[]> {
  const queryVector = await generateTextEmbedding(query);
  const results: SearchResult[] = [];

  for (const doc of knowledgeDocs) {
    const docVector = doc.embedding || (await generateTextEmbedding(doc.content));
    const similarity = cosineSimilarity(queryVector, docVector);
    results.push({ doc, similarityScore: similarity });
  }

  // Sort descending by similarity score
  results.sort((a, b) => b.similarityScore - a.similarityScore);
  return results.slice(0, topK);
}
