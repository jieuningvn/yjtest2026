import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScoreViewer from '../components/ScoreViewer';
import MRAudioPlayer from '../components/MRAudioPlayer';
import MissionSection from '../components/MissionSection';
import QuizSection from '../components/QuizSection';

const NewWorldSymphony = () => {
  const navigate = useNavigate();
  
  // State management
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [missionCompleted, setMissionCompleted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const allStagesCompleted = audioPlayed && missionCompleted && quizCompleted;

  const handleNextStage = () => {
    if (allStagesCompleted) {
      navigate('/spring');
    }
  };

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="page-meta">
          <span className="stage-badge">1단계</span>
          <span className="stage-info">음악 학습 앱 베타</span>
        </div>
        <h1>신세계 교향곡</h1>
        <p style={{ textAlign: 'center', color: '#636e72', marginTop: '-5px', fontSize: '0.95rem' }}>
          작곡가: 안토닌 드보르자크
        </p>
      </header>

      {/* Progress Flow Status Bar */}
      <div className="progress-steps-container">
        <div className={`progress-step ${audioPlayed ? 'completed' : ''}`}>
          {audioPlayed ? '✅' : '1️⃣'} 오디오 재생
        </div>
        <div className={`progress-step ${missionCompleted ? 'completed' : ''}`}>
          {missionCompleted ? '✅' : '2️⃣'} 미션 완료
        </div>
        <div className={`progress-step ${quizCompleted ? 'completed' : ''}`}>
          {quizCompleted ? '✅' : '3️⃣'} 퀴즈 풀이
        </div>
      </div>

      {/* Score Viewer Section */}
      <section className="section sheet-section">
        <div className="section-header-row">
          <h3>악보</h3>
          <span className="status-indicator done">플레이스홀더</span>
        </div>
        <ScoreViewer />
      </section>

      {/* MR Audio Player Section */}
      <section className={`section player-section ${audioPlayed ? 'completed' : ''}`}>
        <MRAudioPlayer
          audioUrl="/music.mp3"
          trackName="신세계 교향곡 - 메인 테마 (MR)"
          onPlayed={() => setAudioPlayed(true)}
        />
      </section>

      {/* Mission Section */}
      <MissionSection
        missionText="주요 금관악기 테마를 주의 깊게 듣고, 리듬의 박자에 맞춰 발을 탭하며 따라가보세요."
        isCompleted={missionCompleted}
        onComplete={() => setMissionCompleted(true)}
      />

      {/* Quiz Section */}
      <QuizSection
        question="'신세계 교향곡'을 작곡한 사람은 누구일까요?"
        options={['루트비히 판 베토벤', '안토닌 드보르자크', '볼프강 아마데우스 모차르트', '안토니오 비발디']}
        correctAnswer="안토닌 드보르자크"
        isCompleted={quizCompleted}
        onComplete={() => setQuizCompleted(true)}
      />

      {/* Progress Flow Navigation Footer */}
      <div className="stage-navigation-footer">
        <button
          onClick={handleNextStage}
          disabled={!allStagesCompleted}
          className="next-stage-btn"
        >
          다음 단계로 이동 (비발디 - 봄) ➔
        </button>
        {!allStagesCompleted && (
          <p className="next-stage-hint">
            * 다음 단계로 넘어가려면 모든 단계(오디오 재생, 미션 완료, 퀴즈 풀이)를 완료해 주세요.
          </p>
        )}
      </div>
    </div>
  );
};

export default NewWorldSymphony;
