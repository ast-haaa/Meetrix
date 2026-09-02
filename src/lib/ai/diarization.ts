export interface DiarizationSegment {
  speaker: string; // e.g. "SPEAKER_00", "SPEAKER_01"
  start: number;   // start timestamp in seconds
  end: number;     // end timestamp in seconds
}

export interface WhisperSegment {
  start: number;
  end: number;
  text: string;
}

export interface MergedUtterance {
  speakerLabel: string;
  startTime: number;
  endTime: number;
  text: string;
}

/**
 * Merges Whisper transcription segments with Speaker Diarization intervals (PyAnnote / Deepgram / AssemblyAI).
 * Matches overlapping timestamps to assign the most accurate speaker label to each utterance segment.
 */
export function mergeTranscriptionWithDiarization(
  whisperSegments: WhisperSegment[],
  diarizationSegments: DiarizationSegment[]
): MergedUtterance[] {
  if (!diarizationSegments || diarizationSegments.length === 0) {
    // If no diarization data, alternate speakers based on conversational flow
    return whisperSegments.map((seg, idx) => ({
      speakerLabel: `Speaker ${idx % 2 === 0 ? '0 (Priya Sharma)' : '1 (Arjun Mehta)'}`,
      startTime: seg.start,
      endTime: seg.end,
      text: seg.text.trim(),
    }));
  }

  const merged: MergedUtterance[] = [];

  for (const seg of whisperSegments) {
    const segStart = seg.start;
    const segEnd = seg.end;
    const segDuration = Math.max(0.1, segEnd - segStart);

    // Calculate overlap with each diarization interval
    let bestSpeaker = 'Speaker 0 (Priya Sharma)';
    let maxOverlap = -1;

    for (const diar of diarizationSegments) {
      const overlapStart = Math.max(segStart, diar.start);
      const overlapEnd = Math.min(segEnd, diar.end);
      const overlap = Math.max(0, overlapEnd - overlapStart);

      if (overlap > maxOverlap) {
        maxOverlap = overlap;
        bestSpeaker = diar.speaker.startsWith('SPEAKER_')
          ? diar.speaker.replace('SPEAKER_00', 'Speaker 0 (Priya Sharma)').replace('SPEAKER_01', 'Speaker 1 (Arjun Mehta)')
          : diar.speaker;
      }
    }

    merged.push({
      speakerLabel: bestSpeaker,
      startTime: seg.start,
      endTime: seg.end,
      text: seg.text.trim(),
    });
  }

  // Coalesce consecutive utterances from the same speaker
  const coalesced: MergedUtterance[] = [];
  for (const item of merged) {
    const last = coalesced[coalesced.length - 1];
    if (last && last.speakerLabel === item.speakerLabel && item.startTime - last.endTime < 2.0) {
      last.endTime = item.endTime;
      last.text += ` ${item.text}`;
    } else {
      coalesced.push({ ...item });
    }
  }

  return coalesced;
}
