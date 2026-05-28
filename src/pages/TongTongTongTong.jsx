import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScoreViewer from '../components/ScoreViewer';
import MRAudioPlayer from '../components/MRAudioPlayer';
import QuizSection from '../components/QuizSection';

const TongTongTongTong = () => {
  const navigate = useNavigate();
  
  // State management
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const allStagesCompleted = audioPlayed && quizCompleted;

  const handleNextStage = () => {
    if (allStagesCompleted) {
      navigate('/newworld');
    }
  };

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="page-meta">
          <span className="stage-badge">1단계</span>
          <span className="stage-info">음악 학습 앱 베타</span>
        </div>
        <h1>통통통통</h1>
        <p style={{ textAlign: 'center', color: '#636e72', marginTop: '-5px', fontSize: '0.95rem' }}>
          분류: 한국 동요
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
      <section className="section intro-section">
        <div className="section-header-row">
          <h3>곡 소개</h3>
        </div>
        <div className="mission-text-box" style={{ background: 'rgba(255, 255, 255, 0.7)', borderLeft: '4px solid var(--primary-color)', padding: '15px', borderRadius: '4px 12px 12px 4px', fontSize: '0.95rem', lineHeight: '1.6' }}>
          <strong>통통통통 (Tong Tong Tong Tong)</strong>
          <p style={{ marginTop: '8px' }}>
            어린이들에게 매우 친숙하고 활기찬 한국의 대표적인 유희 동요입니다. 
            단순하고 반복적인 리듬과 멜로디로 구성되어 있어 악기를 처음 배우는 입문자들이 박자감과 손가락 독립성을 연습하기에 아주 좋은 곡입니다.
            신나게 피아노나 바이올린 건반을 두드리며 곡의 즐거운 분위기를 몸으로 느껴보세요!
          </p>
        </div>
      </section>

      {/* 2. 악보 보기 Section */}
      <section className="section sheet-section">
        <div className="section-header-row">
          <h3>악보 보기</h3>
          <span className="status-indicator done">MusicXML</span>
        </div>
        <ScoreViewer musicXmlUrl="/tongtong.musicxml" />
      </section>

      {/* 3. MR 재생 Section */}
      <section className={`section player-section ${audioPlayed ? 'completed' : ''}`}>
        <MRAudioPlayer
          audioUrl="/music.mp3"
          trackName="통통통통 (MR)"
          onPlayed={() => setAudioPlayed(true)}
        />
      </section>

      {/* 4. 퀴즈 Section */}
      <QuizSection
        question="이 동요의 제목은 무엇일까요?"
        options={['통통통통', '나비야', '비행기', '곰 세 마리']}
        correctAnswer="통통통통"
        isCompleted={quizCompleted}
        onComplete={() => setQuizCompleted(true)}
      />

      {/* 5. 다음 단계 버튼 Footer */}
      <div className="stage-navigation-footer">
        <button
          onClick={handleNextStage}
          disabled={!allStagesCompleted}
          className="next-stage-btn"
        >
          다음 단계로 이동 (신세계 교향곡) ➔
        </button>
        {!allStagesCompleted && (
          <p className="next-stage-hint">
            * 다음 단계로 넘어가려면 모든 단계(오디오 재생, 퀴즈 풀이)를 완료해 주세요.
          </p>
        )}
      </div>
    </div>
  );
};

export default TongTongTongTong;
