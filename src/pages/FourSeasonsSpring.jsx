import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScoreViewer from '../components/ScoreViewer';
import MRAudioPlayer from '../components/MRAudioPlayer';
import MissionSection from '../components/MissionSection';
import QuizSection from '../components/QuizSection';
import springAudio from '../assets/springmp3.mp3';

const FourSeasonsSpring = () => {
  const navigate = useNavigate();
  
  // State management
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [missionCompleted, setMissionCompleted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const allStagesCompleted = audioPlayed && missionCompleted && quizCompleted;

  const handleFinishStage = () => {
    if (allStagesCompleted) {
      navigate('/success');
    }
  };

  const handlePrevStage = () => {
    navigate('/newworld');
  };

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="page-meta">
          <span className="stage-badge">3단계</span>
          <span className="stage-info">음악 학습 앱 베타</span>
        </div>
        <h1>사계 - 봄</h1>
        <p style={{ textAlign: 'center', color: '#636e72', marginTop: '-5px', fontSize: '0.95rem' }}>
          작곡가: 안토니오 비발디
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
          <h3>악보 보기</h3>
          <span className="status-indicator done">MusicXML</span>
        </div>
        <ScoreViewer musicXmlUrl="/spring.mxl" />
      </section>

      {/* MR Audio Player Section */}
      <section className={`section player-section ${audioPlayed ? 'completed' : ''}`}>
        <MRAudioPlayer
          audioUrl={springAudio}
          trackName="비발디 사계: 봄 - 알레그로 (MR)"
          onPlayed={() => setAudioPlayed(true)}
        />
      </section>

      {/* Mission Section */}
      <MissionSection
        missionText="곡을 들으며 활기찬 메인 바이올린 테마에 집중해 보세요. 후렴구가 총 몇 번 반복되는지 세어보세요."
        isCompleted={missionCompleted}
        onComplete={() => setMissionCompleted(true)}
      />

      {/* Quiz Section */}
      <QuizSection
        question="이 클래식 악장은 어떤 계절을 나타내나요?"
        options={['봄', '여름', '가을', '겨울']}
        correctAnswer="봄"
        isCompleted={quizCompleted}
        onComplete={() => setQuizCompleted(true)}
      />

      {/* Progress Flow Navigation Footer */}
      <div className="stage-navigation-footer">
        <button
          onClick={handleFinishStage}
          disabled={!allStagesCompleted}
          className="next-stage-btn"
        >
          스테이지 완료 🎉
        </button>
        {!allStagesCompleted && (
          <p className="next-stage-hint">
            * 스테이지를 완료하려면 모든 단계(오디오 재생, 미션 완료, 퀴즈 풀이)를 완료해 주세요.
          </p>
        )}
        <button
          onClick={handlePrevStage}
          className="mission-btn"
          style={{ background: 'transparent', color: '#636e72', border: '1px solid #dcdde1', marginTop: '5px' }}
        >
          ⬅ 2단계로 돌아가기 (신세계 교향곡)
        </button>
      </div>
    </div>
  );
};

export default FourSeasonsSpring;
