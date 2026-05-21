import React, { useState, useRef, useEffect } from 'react';

const MRAudioPlayer = ({ audioUrl, onPlayed, trackName }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const audioRef = useRef(null);

  // Stop playback when component unmounts or audioUrl changes
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          if (!hasPlayed) {
            setHasPlayed(true);
            if (onPlayed) onPlayed();
          }
        })
        .catch((err) => {
          console.error("Audio playback failed: ", err);
          setIsPlaying(true);
          if (!hasPlayed) {
            setHasPlayed(true);
            if (onPlayed) onPlayed();
          }
        });
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="audio-player-container">
      <div className="section-header-row">
        <h3>MR 오디오 플레이어</h3>
        <span className={`status-indicator ${hasPlayed ? 'done' : 'pending'}`}>
          {hasPlayed ? '✅ 재생 완료' : '❌ 재생 필요'}
        </span>
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={handleAudioEnded}
        style={{ display: 'none' }}
      />

      <div className="mr-player-controls">
        <div className="audio-meta-info">
          <div className="track-title">{trackName || "알 수 없는 트랙"}</div>
          <span className={`track-state-badge ${isPlaying ? 'playing' : 'paused'}`}>
            {isPlaying ? '● 재생 중' : '■ 일시정지됨'}
          </span>
        </div>

        <div className="play-controls-row">
          <button
            onClick={togglePlay}
            className="player-main-btn"
            title={isPlaying ? "일시정지" : "재생"}
            aria-label={isPlaying ? "일시정지" : "재생"}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <div className="player-visualizer-mock">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`visualizer-bar ${isPlaying ? `active-bar-${i}` : ''}`}
                style={!isPlaying ? { height: '4px' } : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MRAudioPlayer;
