import { stepToMidiOffset, midiToFrequency } from './noteUtils';

export interface TimelineNote {
  measureNumber: number;
  noteIndex: number; // 1-based index of playable note in measure
  noteName: string;
  octave: number;
  midiNumber: number;
  frequency: number;
  startTime: number; // in beats
  duration: number; // in beats
}

export interface ParsedMusicXml {
  notes: TimelineNote[];
  beats: number;
  beatType: number;
}

/**
 * Fetches a MusicXML file from a URL and parses it into a timeline.
 */
export async function fetchAndParseMusicXml(url: string): Promise<ParsedMusicXml> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch MusicXML from ${url}: ${response.statusText}`);
  }
  const xmlText = await response.text();
  return parseMusicXml(xmlText);
}

/**
 * Parses MusicXML text content into a structured timeline array.
 */
export function parseMusicXml(xmlText: string): ParsedMusicXml {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
  
  // Find first part
  const part = xmlDoc.querySelector('part');
  if (!part) {
    console.warn("No part found in MusicXML");
    return { notes: [], beats: 4, beatType: 4 };
  }
  
  const timeline: TimelineNote[] = [];
  const measures = part.querySelectorAll('measure');
  
  let currentTime = 0; // in beats
  let divisions = 1; // default divisions (how many divisions in a quarter note)
  let beats = 4;
  let beatType = 4;
  
  measures.forEach((measure) => {
    const measureNumberStr = measure.getAttribute('number');
    const measureNumber = measureNumberStr ? parseInt(measureNumberStr, 10) : 0;
    
    // Keep a local 1-based index for non-rest notes in this measure
    let playableNoteIndex = 1;
    
    // Get all children of the measure to parse chronologically
    const childNodes = Array.from(measure.childNodes);
    
    childNodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();
      
      if (tagName === 'attributes') {
        const divElem = element.querySelector('divisions');
        if (divElem && divElem.textContent) {
          divisions = parseFloat(divElem.textContent) || 1;
        }
        const timeElem = element.querySelector('time');
        if (timeElem) {
          const beatsElem = timeElem.querySelector('beats');
          if (beatsElem && beatsElem.textContent) {
            beats = parseInt(beatsElem.textContent, 10) || 4;
          }
          const beatTypeElem = timeElem.querySelector('beat-type');
          if (beatTypeElem && beatTypeElem.textContent) {
            beatType = parseInt(beatTypeElem.textContent, 10) || 4;
          }
        }
      } else if (tagName === 'backup') {
        const durElem = element.querySelector('duration');
        if (durElem && durElem.textContent) {
          const backupDuration = parseFloat(durElem.textContent) || 0;
          currentTime -= backupDuration / divisions;
        }
      } else if (tagName === 'forward') {
        const durElem = element.querySelector('duration');
        if (durElem && durElem.textContent) {
          const forwardDuration = parseFloat(durElem.textContent) || 0;
          currentTime += forwardDuration / divisions;
        }
      } else if (tagName === 'note') {
        const isChord = element.querySelector('chord') !== null;
        const isRest = element.querySelector('rest') !== null;
        
        const durElem = element.querySelector('duration');
        const durationValue = durElem && durElem.textContent ? parseFloat(durElem.textContent) : 0;
        const noteDuration = durationValue / divisions;
        
        if (isChord) {
          // Chord notes start at the same time as the previous note
          const lastNote = timeline[timeline.length - 1];
          const startTime = lastNote ? lastNote.startTime : currentTime;
          
          if (!isRest) {
            const pitchElem = element.querySelector('pitch');
            if (pitchElem) {
              const step = pitchElem.querySelector('step')?.textContent || '';
              const octaveStr = pitchElem.querySelector('octave')?.textContent || '4';
              const octave = parseInt(octaveStr, 10);
              const alterStr = pitchElem.querySelector('alter')?.textContent || '0';
              const alter = parseFloat(alterStr);
              
              const stepOffset = stepToMidiOffset(step);
              const midiNumber = 12 * (octave + 1) + stepOffset + alter;
              const frequency = midiToFrequency(midiNumber);
              
              let alterSign = '';
              if (alter === 1) alterSign = '#';
              else if (alter === -1) alterSign = 'b';
              const noteName = `${step.toUpperCase()}${alterSign}`;
              
              timeline.push({
                measureNumber,
                noteIndex: playableNoteIndex,
                noteName,
                octave,
                midiNumber,
                frequency,
                startTime,
                duration: noteDuration
              });
              playableNoteIndex++;
            }
          }
        } else {
          // Normal note
          const startTime = currentTime;
          
          if (!isRest) {
            const pitchElem = element.querySelector('pitch');
            if (pitchElem) {
              const step = pitchElem.querySelector('step')?.textContent || '';
              const octaveStr = pitchElem.querySelector('octave')?.textContent || '4';
              const octave = parseInt(octaveStr, 10);
              const alterStr = pitchElem.querySelector('alter')?.textContent || '0';
              const alter = parseFloat(alterStr);
              
              const stepOffset = stepToMidiOffset(step);
              const midiNumber = 12 * (octave + 1) + stepOffset + alter;
              const frequency = midiToFrequency(midiNumber);
              
              let alterSign = '';
              if (alter === 1) alterSign = '#';
              else if (alter === -1) alterSign = 'b';
              const noteName = `${step.toUpperCase()}${alterSign}`;
              
              timeline.push({
                measureNumber,
                noteIndex: playableNoteIndex,
                noteName,
                octave,
                midiNumber,
                frequency,
                startTime,
                duration: noteDuration
              });
              playableNoteIndex++;
            }
          }
          
          // Advance the timeline by note duration (even if it's a rest)
          currentTime += noteDuration;
        }
      }
    });
  });
  
  return {
    notes: timeline,
    beats,
    beatType
  };
}
