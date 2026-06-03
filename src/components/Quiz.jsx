import React, { useState } from 'react';

const Quiz = () => {
  const [result, setResult] = useState('');
  const [selected, setSelected] = useState(null);

  const handleAnswer = (answer) => {
    setSelected(answer);
    if (answer === '미') {
      setResult('정답입니다! 🎉');
    } else {
      setResult('다시 생각해보세요');
    }
  };

  return (
    <div className="quiz-container">
      <h3>퀴즈</h3>
      <p className="quiz-question">첫 음의 계이름은?</p>
      <div className="quiz-options">
        {['도', '레', '미'].map((note) => (
          <button
            key={note}
            className={`quiz-button ${selected === note ? 'selected' : ''}`}
            onClick={() => handleAnswer(note)}
          >
            {note}
          </button>
        ))}
      </div>
      {result && (
        <p className={`quiz-result ${result === '정답입니다! 🎉' ? 'success' : 'error'}`}>
          {result}
        </p>
      )}
    </div>
  );
};

export default Quiz;
