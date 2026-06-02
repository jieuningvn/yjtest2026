import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScoreViewer from '../components/ScoreViewer';
import MRAudioPlayer from '../components/MRAudioPlayer';
import QuizSection from '../components/QuizSection';
import ssgAudio from '../assets/ssgmp3.mp3';

const NewWorldSymphony = () => {
  const navigate = useNavigate();

  // State management
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

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
      <section className="section intro-section">
        <div className="section-header-row">
          <h3>곡 소개</h3>
        </div>
        <div className="mission-text-box" style={{ background: 'rgba(255, 255, 255, 0.7)', borderLeft: '4px solid var(--primary-color)', padding: '15px', borderRadius: '4px 12px 12px 4px', fontSize: '0.95rem', lineHeight: '1.6' }}>
          <strong>신세계로부터 (From the New World)</strong>
          <p style={{ marginTop: '8px' }}>
            안토닌 드보르자크가 1893년 미국 뉴욕 국립 음악원장으로 재직하던 시절 작곡한 그의 대표적인 교향곡 제9번입니다.
            미국의 광활한 자연과 흑인 영가, 인디언 민요 등 새로운 세계의 인상에서 깊은 영감을 받아 완성되었습니다.
            고향에 대한 그리움과 신세계에 대한 경이로움이 가득 찬 역동적이면서도 아름다운 선율을 느껴보세요.
          </p>
        </div>
      </section>

      {/* 2. 악보 보기 Section */}
      <section className="section sheet-section">
        <div className="section-header-row">
          <h3>악보 보기</h3>
          <span className="status-indicator done">MusicXML</span>
        </div>
        <ScoreViewer musicXmlUrl="/ssgscore.musicxml" />
      </section>

      {/* 3. MR 재생 Section */}
      <section className={`section player-section ${audioPlayed ? 'completed' : ''}`}>
        <MRAudioPlayer
          audioUrl={ssgAudio}
          trackName="신세계 교향곡 - 메인 테마 (MR)"
          onPlayed={() => setAudioPlayed(true)}
        />
      </section>

      {/* 4. 퀴즈 Section */}
      <QuizSection
        question="'신세계 교향곡'을 작곡한 사람은 누구일까요?"
        options={['루트비히 판 베토벤', '안토닌 드보르자크', '볼프강 아마데우스 모차르트', '안토니오 비발디']}
        correctAnswer="안토닌 드보르자크"
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
