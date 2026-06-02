import React, { useState, useEffect, useRef } from 'react';

interface VisualMetronomeProps {
  bpm: number;
  beats: number;
  isPlaying: boolean;
  onBeat?: (beat: number) => void;
}

export const VisualMetronome: React.FC<VisualMetronomeProps> = ({
  bpm,
  beats = 4,
  isPlaying,
  onBeat,
}) => {
  const [currentBeat, setCurrentBeat] = useState<number>(1);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);
  
  const intervalRef = useRef<any>(null);
  const onBeatRef = useRef(onBeat);

  // Sync the latest onBeat callback
  useEffect(() => {
    onBeatRef.current = onBeat;
  }, [onBeat]);

  const beatIntervalMs = 60000 / bpm;

  useEffect(() => {
    // Clean up any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isPlaying) {
      setCurrentBeat(1);
      setIsFlashActive(false);
      return;
    }

    const startTime = performance.now();
    let nextBeatIndex = 0;

    const checkBeat = () => {
      const elapsed = performance.now() - startTime;
      const targetTime = nextBeatIndex * beatIntervalMs;

      if (elapsed >= targetTime) {
        const beatNumber = (nextBeatIndex % beats) + 1;
        setCurrentBeat(beatNumber);
        setIsFlashActive(true);

        if (onBeatRef.current) {
          onBeatRef.current(beatNumber);
        }

        // Output debug logs as requested
        console.log(
          `[Metronome Debug] bpm: ${bpm}, interval: ${beatIntervalMs.toFixed(1)}ms, beat: ${beatNumber}/${beats}, isRunning: ${isPlaying}`
        );

        nextBeatIndex++;
      }
    };

    // Trigger the first beat immediately
    checkBeat();

    // High frequency interval (10ms) to check elapsed time and trigger beats precisely
    const intervalId = setInterval(checkBeat, 10);
    intervalRef.current = intervalId;

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying, bpm, beats, beatIntervalMs]);

  // Handle flash decay
  useEffect(() => {
    if (isFlashActive) {
      const timer = setTimeout(() => {
        setIsFlashActive(false);
      }, 150); // Flash duration
      return () => clearTimeout(timer);
    }
  }, [isFlashActive, currentBeat]);

  const isStrongBeat = currentBeat === 1;

  return (
    <div style={{
      background: '#1e272e',
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '15px',
      width: '100%',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      marginTop: '10px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '8px',
        marginBottom: '5px',
      }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ff7675', letterSpacing: '1px' }}>
          👁️ VISUAL METRONOME
        </span>
        <span style={{
          fontSize: '0.75rem',
          padding: '2px 8px',
          borderRadius: '20px',
          background: isPlaying ? 'rgba(255, 56, 56, 0.15)' : 'rgba(255,255,255,0.05)',
          color: isPlaying ? '#ff7675' : '#95a5a6',
          fontWeight: 700,
        }}>
          {isPlaying ? '작동 중 (무음)' : '대기 중'}
        </span>
      </div>

      {/* Main Flash Area */}
      <div style={{
        height: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: '100%',
      }}>
        {/* Glowing bulb */}
        <div style={{
          width: isStrongBeat ? '80px' : '60px',
          height: isStrongBeat ? '80px' : '60px',
          borderRadius: '50%',
          background: isPlaying && isFlashActive
            ? '#ff3838'
            : '#400a0a',
          boxShadow: isPlaying && isFlashActive
            ? (isStrongBeat 
                ? '0 0 45px #ff3838, 0 0 20px rgba(255, 56, 56, 0.8)' 
                : '0 0 30px #ff3838, 0 0 12px rgba(255, 56, 56, 0.6)')
            : '0 0 10px rgba(0, 0, 0, 0.5) inset',
          border: isPlaying && isFlashActive
            ? '2.5px solid #ff6b81'
            : '2.5px solid #2c0000',
          transform: isPlaying && isFlashActive ? 'scale(1.15)' : 'scale(1)',
          transition: isPlaying && isFlashActive ? 'transform 0.05s ease-out' : 'all 0.15s ease-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isPlaying && isFlashActive ? '#fff' : 'rgba(255,255,255,0.2)',
          fontWeight: 800,
          fontSize: isStrongBeat ? '2rem' : '1.5rem',
          textShadow: isPlaying && isFlashActive ? '0 2px 6px rgba(0,0,0,0.5)' : 'none',
        }}>
          {isPlaying ? currentBeat : '-'}
        </div>
      </div>

      {/* Beat Progress Dots Indicator */}
      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '5px',
      }}>
        {Array.from({ length: beats }).map((_, idx) => {
          const beatNum = idx + 1;
          const isActive = isPlaying && currentBeat === beatNum;
          const isFirst = beatNum === 1;

          return (
            <div
              key={idx}
              style={{
                width: isFirst ? '14px' : '10px',
                height: isFirst ? '14px' : '10px',
                borderRadius: '50%',
                background: isActive 
                  ? (isFirst ? '#ff3838' : '#ff7675') 
                  : 'rgba(255, 255, 255, 0.15)',
                border: isFirst ? '1.5px solid rgba(255, 56, 56, 0.4)' : 'none',
                boxShadow: isActive 
                  ? (isFirst ? '0 0 10px #ff3838' : '0 0 6px #ff7675') 
                  : 'none',
                transform: isActive ? 'scale(1.25)' : 'scale(1)',
                transition: 'all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              }}
            />
          );
        })}
      </div>

      {/* BPM display */}
      <div style={{
        fontSize: '0.9rem',
        color: '#a4b0be',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '5px',
      }}>
        <span>BPM: <strong style={{ color: '#ff7675' }}>{bpm}</strong></span>
        <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
        <span>Beat: <strong style={{ color: '#ff7675' }}>{isPlaying ? currentBeat : 1} / {beats}</strong></span>
      </div>

      {/* Debug Info Panel */}
      <div style={{
        marginTop: '5px',
        padding: '8px 12px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '8px',
        fontSize: '0.75rem',
        fontFamily: 'monospace',
        color: '#a4b0be',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        border: '1px dashed rgba(255,255,255,0.1)'
      }}>
        <div style={{ color: '#ff7675', fontWeight: 'bold' }}>⚙️ DEBUG METADATA</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
          <span>currentBpm: {bpm}</span>
          <span>beatIntervalMs: {beatIntervalMs.toFixed(1)}ms</span>
          <span>currentBeat: {isPlaying ? currentBeat : '-'}</span>
          <span>isMetronomeRunning: {isPlaying ? 'true' : 'false'}</span>
        </div>
      </div>
    </div>
  );
};
