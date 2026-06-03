import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ScoreViewer from '../components/ScoreViewer';
import MRAudioPlayer from '../components/MRAudioPlayer';
import QuizSection from '../components/QuizSection';
import PracticeRecorder from '../components/PracticeRecorder';
import ssgAudio from '../assets/ssgmp3.mp3';
import StageProgressBar from '../components/StageProgressBar';


const NewWorldSymphony = () => {
  const navigate = useNavigate();
  const mrPlayerRef = useRef(null);

  // State management
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [scoredNotes, setScoredNotes] = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);

  const allStagesCompleted = audioPlayed && quizCompleted;

  const handleNextStage = () => {
    if (allStagesCompleted) {
      navigate('/spring');
    }
  };

  const handlePrevStage = () => {
    navigate('/');
  };

  return (
    <div className="lesson-page">
      <StageProgressBar currentStage={2} />
      <header className="lesson-header">
        <div className="page-meta">
          <span className="stage-badge">2단계</span>
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
        <div className={`progress-step ${quizCompleted ? 'completed' : ''}`}>
          {quizCompleted ? '✅' : '2️⃣'} 퀴즈 풀이
        </div>
      </div>

      {/* 1. 곡 소개 Section */}
      <section className={`section intro-section ${descExpanded ? 'expanded' : ''}`}>
        <div 
          className="section-header-row" 
          onClick={() => setDescExpanded(!descExpanded)} 
          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <h3>곡 소개</h3>
          <button 
            className="desc-toggle-btn" 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--primary-color)', 
              fontSize: '0.85rem', 
              fontWeight: 600, 
              cursor: 'pointer' 
            }}
          >
            {descExpanded ? '접기 ▲' : '더보기 ▼'}
          </button>
        </div>
        <div className="mission-text-box" style={{ background: 'rgba(255, 255, 255, 0.7)', borderLeft: '4px solid var(--primary-color)', padding: '15px', borderRadius: '4px 12px 12px 4px', fontSize: '0.95rem', lineHeight: '1.6' }}>
          <p>
            드보르자크의 교향곡 제9번 「신세계로부터」는 1893년에 작곡된 작품입니다. 드보르자크는 고향 체코의 전통과 민족적 색채를 음악에 담은 대표적인 민족주의 작곡가입니다. 이 작품은 미국에서 받은 인상과 새로운 문화에 대한 관심이 반영되어 있으며, 특히 4악장은 힘차고 웅장한 주제가 반복되어 강한 에너지를 느낄 수 있습니다.
          </p>
        </div>
      </section>

      {/* 2. 악보 보기 Section */}
      <section className="section sheet-section">
        <div className="section-header-row">
          <h3>악보 보기</h3>
          <span className="status-indicator done">MusicXML</span>
        </div>
        <ScoreViewer musicXmlUrl="/ssgscore.musicxml" scoredNotes={scoredNotes} />
      </section>

      {/* Hidden MR Player state container */}
      <MRAudioPlayer
        audioUrl={ssgAudio}
        trackName="신세계 교향곡 - 메인 테마 (MR)"
        onPlayed={() => setAudioPlayed(true)}
        playerRef={mrPlayerRef}
        hideUI={true}
      />

      {/* 연주 분석 및 채점 Section */}
      <PracticeRecorder
        musicXmlUrl="/ssgscore.musicxml"
        mrPlayerRef={mrPlayerRef}
        onScored={setScoredNotes}
      />

      {/* 4. 퀴즈 Section */}
      <QuizSection
        question="신세계 교향곡은 몇 년에 작곡되었을까요?"
        options={['1788년', '1824년', '1893년', '1905년']}
        correctAnswer="1893년"
        isCompleted={quizCompleted}
        onComplete={() => setQuizCompleted(true)}
        successMessage={`🎉 정답입니다!\n드보르자크의 교향곡 제9번 「신세계로부터」는 1893년에 완성된 작품입니다.`}
        errorMessage="❌ 다시 생각해 보세요!"
      />

      {/* 5. 다음 단계 버튼 Footer */}
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
            * 다음 단계로 넘어가려면 모든 단계(오디오 재생, 퀴즈 풀이)를 완료해 주세요.
          </p>
        )}
        <button
          onClick={handlePrevStage}
          className="mission-btn"
          style={{ background: 'transparent', color: '#636e72', border: '1px solid #dcdde1', marginTop: '5px' }}
        >
          ⬅ 1단계로 돌아가기 (통통통통)
        </button>
      </div>
    </div>
  );
};

export default NewWorldSymphony;
