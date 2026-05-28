import React from 'react';
import { useNavigate } from 'react-router-dom';

const SuccessPage = () => {
  const navigate = useNavigate();

  const handleRestart = () => {
    navigate('/');
  };

  return (
    <div className="success-page-container">
      <div className="success-badge-icon">🎓🏆🎉</div>
      <h1 className="success-title">축하합니다!</h1>
      <p className="success-desc">
        베타 음악 학습의 모든 단계를 성공적으로 완료하셨습니다:
        <br />
        <strong>1. 통통통통</strong>
        <br />
        <strong>2. 신세계 교향곡</strong>
        <br />
        <strong>3. 사계 - 봄</strong>
      </p>
      
      <div style={{ background: 'rgba(255,255,255,0.6)', padding: '20px', borderRadius: '16px', marginBottom: '30px', border: '1px solid rgba(0,0,0,0.05)' }}>
        <p style={{ fontSize: '0.9rem', color: '#2d3436' }}>
          <strong>🔒 정식 출시 버전 예고:</strong>
          <br />
          향후 `<ScoreViewer />`를 사용한 실시간 피드백 및 전체 MusicXML 렌더링 기능이 통합될 예정입니다. 계속 연습해 보세요!
        </p>
      </div>

      <button
        onClick={handleRestart}
        className="next-stage-btn"
        style={{ width: '100%', maxWidth: '280px' }}
      >
        🔄 학습 다시 시작하기
      </button>
    </div>
  );
};

export default SuccessPage;
