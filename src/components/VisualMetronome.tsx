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
  
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastBeatIndexRef = useRef<number>(-1);

  useEffect(() => {
    if (!isPlaying) {
      setCurrentBeat(1);
      setIsFlashActive(false);
      lastBeatIndexRef.current = -1;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    startTimeRef.current = performance.now();
    lastBeatIndexRef.current = -1;

    const beatDurationMs = (60 / bpm) * 1000;

    const tick = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const beatIndex = Math.floor(elapsed / beatDurationMs);

      if (beatIndex !== lastBeatIndexRef.current) {
        lastBeatIndexRef.current = beatIndex;
        const beatNumber = (beatIndex % beats) + 1;
        
        setCurrentBeat(beatNumber);
        setIsFlashActive(true);
        
        if (onBeat) {
          onBeat(beatNumber);
        }
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, bpm, beats, onBeat]);

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
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
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
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#9ef', letterSpacing: '1px' }}>
          👁️ VISUAL METRONOME
        </span>
        <span style={{
          fontSize: '0.75rem',
          padding: '2px 8px',
          borderRadius: '20px',
          background: isPlaying ? 'rgba(0, 206, 201, 0.15)' : 'rgba(255,255,255,0.05)',
          color: isPlaying ? '#00cec9' : '#95a5a6',
          fontWeight: 700,
        }}>
          {isPlaying ? '작동 중 (무음)' : '대기 중'}
        </span>
      </div>

      {/* Main Flash Area */}
      <div style={{
        height: '90px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: '100%',
      }}>
        {/* Glowing bulb */}
        <div style={{
          width: isStrongBeat ? '70px' : '50px',
          height: isStrongBeat ? '70px' : '50px',
          borderRadius: '50%',
          background: isPlaying && isFlashActive
            ? (isStrongBeat ? '#00cec9' : '#6366f1')
            : '#2f3542',
          boxShadow: isPlaying && isFlashActive
            ? (isStrongBeat 
                ? '0 0 35px #00cec9, 0 0 15px rgba(0, 206, 201, 0.6)' 
                : '0 0 25px #6366f1, 0 0 10px rgba(99, 102, 241, 0.6)')
            : 'none',
          transform: isPlaying && isFlashActive ? 'scale(1.1)' : 'scale(1)',
          transition: isPlaying && isFlashActive ? 'transform 0.05s ease-out' : 'all 0.15s ease-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isPlaying && isFlashActive ? '#fff' : 'rgba(255,255,255,0.15)',
          fontWeight: 800,
          fontSize: isStrongBeat ? '1.8rem' : '1.3rem',
          textShadow: isPlaying && isFlashActive ? '0 2px 4px rgba(0,0,0,0.3)' : 'none',
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
                  ? (isFirst ? '#00cec9' : '#6366f1') 
                  : 'rgba(255, 255, 255, 0.15)',
                border: isFirst ? '1.5px solid rgba(0, 206, 201, 0.4)' : 'none',
                boxShadow: isActive 
                  ? (isFirst ? '0 0 8px #00cec9' : '0 0 6px #6366f1') 
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
        fontSize: '0.8rem',
        color: '#7f8c8d',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}>
        <span>박자:</span>
        <strong style={{ color: '#fff' }}>{beats}박자</strong>
        <span style={{ margin: '0 4px', color: '#555' }}>|</span>
        <span>속도:</span>
        <strong style={{ color: '#fff' }}>{bpm} BPM</strong>
      </div>
    </div>
  );
};
