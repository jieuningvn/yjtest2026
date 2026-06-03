import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ScoreViewer from '../components/ScoreViewer';
import MRAudioPlayer from '../components/MRAudioPlayer';
import QuizSection from '../components/QuizSection';
import PracticeRecorder from '../components/PracticeRecorder';
import springAudio from '../assets/Spring.wav';

const FourSeasonsSpring = () => {
  const navigate = useNavigate();
  const mrPlayerRef = useRef(null);
  
  // State management
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [scoredNotes, setScoredNotes] = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);

  const allStagesCompleted = audioPlayed && quizCompleted;

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
          <strong>사계 - 봄 (Le quattro stagioni - La primavera)</strong>
          <p style={{ marginTop: '8px' }}>
            이탈리아의 작곡가 안토니오 비발디가 1725년에 발표한 그의 유명한 바이올린 협주곡 집 '사계' 중 첫 번째 곡입니다.
            봄이 오는 기쁨을 노래하는 화사하고 생기 넘치는 멜로디가 매력적입니다.
            새들의 노랫소리, 속삭이는 시냇물, 따스한 봄바람의 싱그러운 묘사를 생각하며 활기차게 감상하고 연주해 보세요.
          </p>
        </div>
      </section>

      {/* 2. 악보 보기 Section */}
      <section className="section sheet-section">
        <div className="section-header-row">
          <h3>악보 보기</h3>
          <span className="status-indicator done">MusicXML</span>
        </div>
        <ScoreViewer musicXmlUrl="/spring.mxl" scoredNotes={scoredNotes} />
      </section>

      {/* Hidden MR Player state container */}
      <MRAudioPlayer
        audioUrl={springAudio}
        trackName="비발디 사계: 봄 - 알레그로 (MR)"
        onPlayed={() => setAudioPlayed(true)}
        playerRef={mrPlayerRef}
        hideUI={true}
      />

      {/* 연주 분석 및 채점 Section */}
      <PracticeRecorder
        musicXmlUrl="/spring.mxl"
        mrPlayerRef={mrPlayerRef}
        onScored={setScoredNotes}
      />

      {/* 4. 퀴즈 Section */}
      <QuizSection
        question="이 곡의 총 마디 수는 몇 마디인가요?"
        options={['12마디', '13마디', '14마디', '15마디']}
        correctAnswer="14마디"
        isCompleted={quizCompleted}
        onComplete={() => setQuizCompleted(true)}
        successMessage="정답입니다! 🎉"
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
            * 스테이지를 완료하려면 모든 단계(오디오 재생, 퀴즈 풀이)를 완료해 주세요.
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
