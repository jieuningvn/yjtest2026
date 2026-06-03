import React from 'react';

const StageProgressBar = ({ currentStage = 1 }) => {
  // Determine nodes representation based on current stage
  // Stage 1: TongTongTongTong (Active)
  // Stage 2: NewWorldSymphony (Active), TongTongTongTong (Done)
  // Stage 3: FourSeasonsSpring (Active), TongTongTongTong & NewWorldSymphony (Done)
  // Stage 4: SuccessPage (All Done)
  
  const getStepStatus = (stepIndex) => {
    // stepIndex: 1 = TongTongTongTong, 2 = NewWorld, 3 = Vivaldi
    if (currentStage > stepIndex) return 'completed';
    if (currentStage === stepIndex) return 'active';
    return 'todo';
  };

  const getStepIcon = (status) => {
    if (status === 'completed') return '✅';
    if (status === 'active') return '●';
    return '○';
  };

  const progressTexts = {
    1: '1 / 3곡 완료 (33%)',
    2: '2 / 3곡 완료 (67%)',
    3: '3 / 3곡 완료 (100%)',
    4: '3 / 3곡 완료 (100%) 🎉'
  };

  const currentProgressText = progressTexts[currentStage] || '0 / 3곡 완료';

  const status1 = getStepStatus(1);
  const status2 = getStepStatus(2);
  const status3 = getStepStatus(3);

  return (
    <div className="stage-progress-bar-container">
      <div className="stage-progress-header">
        <span className="stage-progress-brand">🎻 Easy Violin</span>
        <span className="stage-progress-percent">{currentProgressText}</span>
      </div>
      
      <div className="stage-progress-track-wrapper">
        <div className="progress-steps-line">
          <div className={`progress-step-node ${status1}`}>
            <span className="node-icon">{getStepIcon(status1)}</span>
            <span className="node-label">통통</span>
          </div>
          
          <div className={`progress-step-connector ${status2 === 'completed' || status2 === 'active' ? 'active' : ''}`} />
          
          <div className={`progress-step-node ${status2}`}>
            <span className="node-icon">{getStepIcon(status2)}</span>
            <span className="node-label">신세계</span>
          </div>
          
          <div className={`progress-step-connector ${status3 === 'completed' || status3 === 'active' ? 'active' : ''}`} />
          
          <div className={`progress-step-node ${status3}`}>
            <span className="node-icon">{getStepIcon(status3)}</span>
            <span className="node-label">비발디</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StageProgressBar;
