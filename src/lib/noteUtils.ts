export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/**
 * Converts a MIDI number to a note name and octave.
 */
export function midiToNoteInfo(midiNumber: number): { noteName: string; octave: number } {
  const rounded = Math.round(midiNumber);
  const noteIndex = ((rounded % 12) + 12) % 12;
  const octave = Math.floor(rounded / 12) - 1;
  return {
    noteName: NOTE_NAMES[noteIndex],
    octave
  };
}

/**
 * Converts frequency in Hz to a MIDI number (fractional).
 */
export function frequencyToMidi(frequency: number): number {
  if (frequency <= 0) return 0;
  return 12 * Math.log2(frequency / 440) + 69;
}

/**
 * Converts a MIDI number to frequency in Hz.
 */
export function midiToFrequency(midiNumber: number): number {
  return 440 * Math.pow(2, (midiNumber - 69) / 12);
}

/**
 * Maps a MusicXML step letter to its semitone offset in the C major scale.
 */
export function stepToMidiOffset(step: string): number {
  switch (step.toUpperCase()) {
    case 'C': return 0;
    case 'D': return 2;
    case 'E': return 4;
    case 'F': return 5;
    case 'G': return 7;
    case 'A': return 9;
    case 'B': return 11;
    default: return 0;
  }
}
