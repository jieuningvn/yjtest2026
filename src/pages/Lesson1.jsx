import React from 'react';
import SheetMusic from '../components/SheetMusic';
import AudioPlayer from '../components/AudioPlayer';
import Quiz from '../components/Quiz';

const Lesson1 = () => {
  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <h1>🎻 1차시: E현 통통통통</h1>
      </header>

      <section className="section sheet-section">
        <SheetMusic />
      </section>

      <section className="section player-section">
        <AudioPlayer />
      </section>

      <section className="section tutorial-section">
        <h3>튜토리얼</h3>
        <p>E현에서 0번 손가락으로 시작하여 천천히 연주해보세요.</p>
      </section>

      <section className="section quiz-section">
        <Quiz />
      </section>
    </div>
  );
};

export default Lesson1;
