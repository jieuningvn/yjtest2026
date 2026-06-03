import React, { useState } from 'react';

const QuizSection = ({ question, options, correctAnswer, isCompleted, onComplete, successMessage, errorMessage }) => {
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');

  const handleAnswerSelect = (option) => {
    setSelected(option);

    if (option === correctAnswer) {
      setFeedback(successMessage || '정답입니다! 🎉');
      onComplete();
    } else {
      setFeedback(errorMessage || '다시 생각해보세요! ❌');
    }
  };

  return (
    <div className={`section quiz-container ${isCompleted ? 'completed' : ''}`}>
      <div className="section-header-row">
        <h3>퀴즈</h3>
        <span className={`status-indicator ${isCompleted ? 'done' : 'pending'}`}>
          {isCompleted ? '✅ 풀이 완료' : '❌ 풀이 전'}
        </span>
      </div>

      <p className="quiz-question">{question}</p>
      
      <div className="quiz-options">
        {options.map((option) => {
          let btnClass = '';
          
          if (selected === option) {
            btnClass = option === correctAnswer ? 'success-selected' : 'error-selected';
          }
          
          if (isCompleted && option === correctAnswer) {
            btnClass = 'success-selected';
          }

          return (
            <button
              key={option}
              disabled={isCompleted}
              className={`quiz-button ${btnClass} ${selected === option ? 'selected' : ''}`}
              onClick={() => handleAnswerSelect(option)}
              style={
                isCompleted && option === correctAnswer
                  ? { background: 'var(--success-color)', color: 'white' }
                  : selected === option && option !== correctAnswer
                  ? { background: 'var(--error-color)', color: 'white' }
                  : undefined
              }
            >
              {option}
            </button>
          );
        })}
      </div>

      {feedback && (
        <p className={`quiz-result ${feedback.includes('정답') ? 'success' : 'error'}`}>
          {feedback}
        </p>
      )}
    </div>
  );
};

export default QuizSection;
