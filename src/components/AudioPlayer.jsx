import React from 'react';

const AudioPlayer = () => {
  return (
    <div className="audio-player-container">
      <h3>MR 재생</h3>
      <audio controls className="audio-player">
        <source src="/music.mp3" type="audio/mpeg" />
        브라우저가 오디오 요소를 지원하지 않습니다.
      </audio>
    </div>
  );
};

export default AudioPlayer;
