import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StageProgressBar from '../components/StageProgressBar';

const SuccessPage = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Resize canvas to cover full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Confetti particles configuration
    const colors = ['#f5cd79', '#f78fb3', '#3dc1d3', '#e15f41', '#786fa6', '#546de5', '#e66767', '#3adeb9'];
    const particleCount = 150;
    const particles = [];

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -canvas.height - 20;
        this.size = Math.random() * 8 + 6;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 3 + 4;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 4 - 2;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;

        // Reset particle when it goes off screen
        if (this.y > canvas.height) {
          this.y = -20;
          this.x = Math.random() * canvas.width;
          this.speedY = Math.random() * 3 + 4;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleRestart = () => {
    navigate('/');
  };

  return (
    <div className="success-page-outer">
      <canvas ref={canvasRef} className="confetti-canvas" />
      <div className="success-page-container">
        <StageProgressBar currentStage={4} />
        <div className="success-badge-icon" style={{ marginTop: '10px' }}>🎓🏆🎻✨</div>
        <h1 className="success-title">스테이지 완료!</h1>
        <p className="success-desc">
          당신은 드디어 3곡을 모두 연주할 수 있게 되었습니다.
          <br />
          바이올린 연주 실력을 활용해서 음악회를 꾸며보세요!
        </p>
        
        <button
          onClick={handleRestart}
          className="next-stage-btn"
          style={{ width: '100%', maxWidth: '280px', zIndex: 10, cursor: 'pointer' }}
        >
          🔄 처음으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
