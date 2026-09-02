import { DecisionStatus } from '@/types';

export interface DecisionTraceResult {
  decisionId: string;
  decisionTitle: string;
  newStatus: DecisionStatus;
  evidenceText: string;
  confidenceScore: number;
  flaggedUnacted: boolean;
}

export async function traceDecisionFollowThrough(
  activeDecisions: Array<{ id: string; title: string; context: string; status: string }>,
  newTranscriptText: string
): Promise<DecisionTraceResult[]> {
  const results: DecisionTraceResult[] = [];

  for (const decision of activeDecisions) {
    const textLower = newTranscriptText.toLowerCase();
    const titleTokens = decision.title.toLowerCase().split(' ').filter((w) => w.length > 3);

    let matchCount = 0;
    for (const token of titleTokens) {
      if (textLower.includes(token)) {
        matchCount++;
      }
    }

    const matchRatio = titleTokens.length > 0 ? matchCount / titleTokens.length : 0;

    if (textLower.includes('unacted') || textLower.includes('haven\'t started') || textLower.includes('blocked') || matchRatio < 0.2) {
      // Flag as unacted alert if there is no mention or explicit mention of inaction
      results.push({
        decisionId: decision.id,
        decisionTitle: decision.title,
        newStatus: 'UNACTED_ALERT',
        evidenceText: textLower.includes('haven\'t started') || textLower.includes('blocked')
          ? 'Transcript explicitly states work on this decision is blocked or has not started.'
          : 'Zero progress or mention detected in recent meeting transcript.',
        confidenceScore: 0.91,
        flaggedUnacted: true,
      });
    } else if (textLower.includes('live') || textLower.includes('completed') || textLower.includes('done') || textLower.includes('passed')) {
      results.push({
        decisionId: decision.id,
        decisionTitle: decision.title,
        newStatus: 'FULFILLED',
        evidenceText: 'Transcript confirms implementation has been completed and verified.',
        confidenceScore: 0.95,
        flaggedUnacted: false,
      });
    } else {
      results.push({
        decisionId: decision.id,
        decisionTitle: decision.title,
        newStatus: 'IN_PROGRESS',
        evidenceText: 'Active discussion detected regarding ongoing implementation.',
        confidenceScore: 0.85,
        flaggedUnacted: false,
      });
    }
  }

  return results;
}
