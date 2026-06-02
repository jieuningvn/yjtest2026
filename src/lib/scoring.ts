import type { TimelineNote } from './musicxmlToTimeline';
import { midiToNoteInfo } from './noteUtils';
import { generateFeedback } from './performanceAnalysis';

export interface UserPitchSample {
  time: number;          // in seconds from recording start
  timeInBeats: number;   // in beats from recording start
  frequency: number;     // detected pitch frequency (Hz)
  midiNumber: number;    // detected MIDI note number
}

export interface ScoredNote {
  measureNumber: number;
  noteIndex: number;
  expectedNote: string;
  detectedNote: string;
  expectedMidi: number;
  detectedMidi: number;
  centsError: number;
  timingError: number;      // Seconds (+ is late, - is early)
  durationError: number;    // Seconds (+ is long, - is short)
  pitchScore: number;
  timingScore: number;
  durationScore: number;
  totalScore: number;
  resultStatus: 'Excellent' | 'Good' | 'Almost' | 'Wrong';
  feedbackMessage: string;
}

export interface ScoringResult {
  notes: ScoredNote[];
  pitchScore: number;
  timingScore: number;
  durationScore: number;
  totalScore: number;
}

/**
 * Calculates the score of a user's violin practice by comparing their recorded pitch samples
 * to the target answer timeline.
 */
export function calculateScoring(
  answerTimeline: TimelineNote[],
  userSamples: UserPitchSample[],
  bpm: number
): ScoringResult {
  const scoredNotes: ScoredNote[] = [];
  
  let totalPitchScore = 0;
  let totalTimingScore = 0;
  let totalDurationScore = 0;
  let totalOverallScore = 0;

  if (answerTimeline.length === 0) {
    return {
      notes: [],
      pitchScore: 0,
      timingScore: 0,
      durationScore: 0,
      totalScore: 0
    };
  }

  // Seconds per beat
  const secPerBeat = 60 / bpm;

  answerTimeline.forEach((note) => {
    // 1. Convert expected time to seconds
    const expectedStartSec = note.startTime * secPerBeat;
    const expectedDurationSec = note.duration * secPerBeat;
    const expectedEndSec = expectedStartSec + expectedDurationSec;

    // 2. Define the tolerance window to search for user samples (+/- 0.4 seconds)
    const windowStart = expectedStartSec - 0.4;
    const windowEnd = expectedEndSec + 0.4;

    // 3. Filter samples inside the window that are close to the target pitch (within 1.8 semitones)
    const noteSamples = userSamples.filter(s => 
      s.time >= windowStart && 
      s.time <= windowEnd && 
      s.frequency > 0 && 
      Math.abs(s.midiNumber - note.midiNumber) <= 1.8
    );

    // Minimum samples required to count as "attempted" (roughly 50-100ms)
    const minAttemptSamples = 3;

    if (noteSamples.length < minAttemptSamples) {
      // Missing note
      scoredNotes.push({
        measureNumber: note.measureNumber,
        noteIndex: note.noteIndex,
        expectedNote: `${note.noteName}${note.octave}`,
        detectedNote: 'Wrong',
        expectedMidi: note.midiNumber,
        detectedMidi: 0,
        centsError: 0,
        timingError: 0,
        durationError: 0,
        pitchScore: 0,
        timingScore: 0,
        durationScore: 0,
        totalScore: 0,
        resultStatus: 'Wrong',
        feedbackMessage: '소리가 감지되지 않았습니다.'
      });
      return;
    }

    // 4. Calculate actual note parameters
    const actualStart = noteSamples[0].time;
    const actualEnd = noteSamples[noteSamples.length - 1].time;
    const actualDuration = actualEnd - actualStart;

    // Errors
    const timingError = actualStart - expectedStartSec;
    const durationError = actualDuration - expectedDurationSec;

    // Pitch cents error (average difference of the played samples)
    const pitchDiffs = noteSamples.map(s => s.midiNumber - note.midiNumber);
    const avgPitchDiff = pitchDiffs.reduce((a, b) => a + b, 0) / pitchDiffs.length;
    const centsError = Math.round(avgPitchDiff * 100);

    // Compute detected note name
    const detectedMidi = note.midiNumber + avgPitchDiff;
    const { noteName: detName, octave: detOct } = midiToNoteInfo(detectedMidi);
    const detectedNote = `${detName}${detOct}`;

    // 5. Score calculation
    // A. Pitch Score (70% weight)
    const absCents = Math.abs(centsError);
    let pitchScore = 0;
    let resultStatus: 'Excellent' | 'Good' | 'Almost' | 'Wrong' = 'Wrong';

    if (absCents <= 30) {
      pitchScore = 100;
      resultStatus = 'Excellent';
    } else if (absCents <= 50) {
      pitchScore = 80;
      resultStatus = 'Good';
    } else if (absCents <= 80) {
      pitchScore = 50;
      resultStatus = 'Almost';
    } else {
      pitchScore = 0;
      resultStatus = 'Wrong';
    }

    // B. Timing Score (20% weight)
    const absTiming = Math.abs(timingError);
    let timingScore = 0;
    if (absTiming <= 0.15) {
      timingScore = 100;
    } else if (absTiming <= 0.30) {
      timingScore = 80;
    } else if (absTiming <= 0.50) {
      timingScore = 50;
    } else {
      timingScore = 0;
    }

    // C. Duration Score (10% weight)
    const durationRatio = actualDuration / expectedDurationSec;
    let durationScore = 0;
    if (durationRatio >= 0.8 && durationRatio <= 1.3) {
      durationScore = 100;
    } else if (durationRatio >= 0.6 && durationRatio <= 1.5) {
      durationScore = 80;
    } else if (durationRatio >= 0.4 && durationRatio <= 1.8) {
      durationScore = 50;
    } else {
      durationScore = 0;
    }

    // D. Total score for this note
    const totalScore = Math.round(
      (pitchScore * 0.7) + (timingScore * 0.2) + (durationScore * 0.1)
    );

    const feedbackMessage = generateFeedback(
      centsError,
      timingError,
      durationError,
      resultStatus,
      detectedMidi
    );

    scoredNotes.push({
      measureNumber: note.measureNumber,
      noteIndex: note.noteIndex,
      expectedNote: `${note.noteName}${note.octave}`,
      detectedNote,
      expectedMidi: note.midiNumber,
      detectedMidi: Math.round(detectedMidi * 10) / 10,
      centsError,
      timingError: Math.round(timingError * 100) / 100,
      durationError: Math.round(durationError * 100) / 100,
      pitchScore,
      timingScore,
      durationScore,
      totalScore,
      resultStatus,
      feedbackMessage
    });

    totalPitchScore += pitchScore;
    totalTimingScore += timingScore;
    totalDurationScore += durationScore;
    totalOverallScore += totalScore;
  });

  const noteCount = answerTimeline.length;
  return {
    notes: scoredNotes,
    pitchScore: Math.round(totalPitchScore / noteCount),
    timingScore: Math.round(totalTimingScore / noteCount),
    durationScore: Math.round(totalDurationScore / noteCount),
    totalScore: Math.round(totalOverallScore / noteCount)
  };
}
