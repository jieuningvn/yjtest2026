import type { ScoredNote } from './scoring';

export interface PerformanceStats {
  wrongNotesList: string[];
  mostWrongNote: string;
  mostFlatNote: string;
  mostSharpNote: string;
  lateMeasures: number[];
  earlyMeasures: number[];
}

/**
 * Generates an educational feedback message based on errors in pitch (cents), timing, and duration.
 */
export function generateFeedback(
  centsError: number,
  timingError: number,
  durationError: number,
  resultStatus: 'Excellent' | 'Good' | 'Almost' | 'Wrong',
  detectedMidi: number
): string {
  // 1. Check if note was not played / missed
  if (detectedMidi === 0) {
    return '소리가 감지되지 않았습니다.';
  }

  // 2. Pitch errors (Highest Priority)
  if (resultStatus === 'Wrong' || resultStatus === 'Almost') {
    if (centsError <= -30) {
      return '음정이 낮습니다.';
    }
    if (centsError >= 30) {
      return '음정이 높습니다.';
    }
  }

  // 3. Timing errors (Medium Priority)
  if (timingError >= 0.15) {
    return '박자가 늦었습니다.';
  }
  if (timingError <= -0.15) {
    return '박자가 빨랐습니다.';
  }

  // 4. Duration errors (Lowest Priority)
  if (durationError <= -0.20) {
    return '음 길이가 짧습니다.';
  }
  if (durationError >= 0.20) {
    return '음 길이가 깁니다.';
  }

  // 5. Positive feedback for success states
  if (resultStatus === 'Excellent') {
    return '완벽한 연주입니다!';
  }
  if (resultStatus === 'Good') {
    return '참 잘했습니다!';
  }

  return '조금 더 연습해 보세요.';
}

/**
 * Evaluates performance logs of graded notes and compiles diagnostic statistics.
 */
export function analyzePerformance(notes: ScoredNote[]): PerformanceStats {
  const wrongNotesList: string[] = [];
  const wrongCounts: Record<string, number> = {};
  const flatCounts: Record<string, number> = {};
  const sharpCounts: Record<string, number> = {};
  const lateMeasuresSet = new Set<number>();
  const earlyMeasuresSet = new Set<number>();

  notes.forEach((note) => {
    const noteNameKey = note.expectedNote;

    // 1. Collect wrong notes details
    if (note.resultStatus === 'Wrong' || note.resultStatus === 'Almost') {
      wrongNotesList.push(
        `${note.measureNumber}마디 ${note.noteIndex}번째 음 (정답: ${note.expectedNote}, 연주: ${note.detectedNote})`
      );
      wrongCounts[noteNameKey] = (wrongCounts[noteNameKey] || 0) + 1;
    }

    // 2. Collect flat/sharp tendencies
    if (note.centsError <= -30 && note.detectedMidi > 0) {
      flatCounts[noteNameKey] = (flatCounts[noteNameKey] || 0) + 1;
    } else if (note.centsError >= 30 && note.detectedMidi > 0) {
      sharpCounts[noteNameKey] = (sharpCounts[noteNameKey] || 0) + 1;
    }

    // 3. Collect rhythm deviations (late/early measures)
    if (note.timingError >= 0.15) {
      lateMeasuresSet.add(note.measureNumber);
    } else if (note.timingError <= -0.15) {
      earlyMeasuresSet.add(note.measureNumber);
    }
  });

  const getMaxKey = (counts: Record<string, number>): string => {
    let maxKey = '없음';
    let maxVal = 0;
    Object.entries(counts).forEach(([key, val]) => {
      if (val > maxVal) {
        maxVal = val;
        maxKey = key;
      }
    });
    return maxKey;
  };

  return {
    wrongNotesList,
    mostWrongNote: getMaxKey(wrongCounts),
    mostFlatNote: getMaxKey(flatCounts),
    mostSharpNote: getMaxKey(sharpCounts),
    lateMeasures: Array.from(lateMeasuresSet).sort((a, b) => a - b),
    earlyMeasures: Array.from(earlyMeasuresSet).sort((a, b) => a - b)
  };
}
