import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ScoreViewer from '../components/ScoreViewer';
import MRAudioPlayer from '../components/MRAudioPlayer';
import QuizSection from '../components/QuizSection';
import PracticeRecorder from '../components/PracticeRecorder';

const TongTongTongTong = () => {
  const navigate = useNavigate();
  const mrPlayerRef = useRef(null);
  
  // State management
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [scoredNotes, setScoredNotes] = useState(null);

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
            이 곡은 악기를 처음 배우는 학생들이 연주하기 좋은 곡입니다. 쉽고 재미있게 첫 연주를 시작해 보세요!
          </p>
        </div>
      </section>

      {/* 2. 악보 보기 Section */}
      <section className="section sheet-section">
        <div className="section-header-row">
          <h3>악보 보기</h3>
          <span className="status-indicator done">MusicXML</span>
        </div>
        <ScoreViewer musicXmlUrl="/tongtong.musicxml" scoredNotes={scoredNotes} />
      </section>

      {/* 3. MR 재생 Section */}
      <section className={`section player-section ${audioPlayed ? 'completed' : ''}`}>
        <MRAudioPlayer
          audioUrl="/music.mp3"
          trackName="통통통통 (MR)"
          onPlayed={() => setAudioPlayed(true)}
          playerRef={mrPlayerRef}
        />
      </section>

      {/* 3.5. 연주 분석 및 채점 Section */}
      <PracticeRecorder
        musicXmlUrl="/tongtong.musicxml"
        mrPlayerRef={mrPlayerRef}
        onScored={setScoredNotes}
      />

      {/* 4. 퀴즈 Section */}
      <QuizSection
        question="맨 첫 번째 음의 박자는 몇 박자인가요?"
        options={['1박자', '2박자', '3박자', '4박자']}
        correctAnswer="1박자"
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
