import React from 'react';

const MissionSection = ({ missionText, isCompleted, onComplete }) => {
  return (
    <div className={`section ${isCompleted ? 'completed' : ''}`}>
      <div className="section-header-row">
        <h3>미션</h3>
        <span className={`status-indicator ${isCompleted ? 'done' : 'pending'}`}>
          {isCompleted ? '✅ 완료됨' : '❌ 대기 중'}
        </span>
      </div>

      <div className="mission-container">
        <div className="mission-text-box">
          <strong>오늘의 미션:</strong>
          <p>{missionText || "배정된 미션이 없습니다."}</p>
        </div>

        <button
          onClick={onComplete}
          disabled={isCompleted}
          className={`mission-btn ${isCompleted ? 'completed' : ''}`}
        >
          {isCompleted ? '미션 완료! 🎉' : '미션 완료하기'}
        </button>
      </div>
    </div>
  );
};

export default MissionSection;
