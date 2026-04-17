import { useRef, useEffect } from 'react';

export default function LetterGlitch({ 
  glitchColors = ["#8B5CF6", "#3B82F6", "#4C1D95"], 
  speed = 1, 
  fontSize = 14,
  gridOpacity = 0.1,
  className = "" 
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    const charsArray = characters.split("");

    let columns = 0;
    let drops = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = new Array(columns).fill(1).map(() => Math.floor(Math.random() * -100));
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      // Fade effect to create trails
      ctx.fillStyle = 'rgba(5, 5, 10, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = charsArray[Math.floor(Math.random() * charsArray.length)];
        
        // Random color from theme
        ctx.fillStyle = glitchColors[Math.floor(Math.random() * glitchColors.length)];
        
        // Draw the character
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        
        ctx.fillText(char, x, y);

        // Reset drop to top randomly
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Increment position
        drops[i] += speed;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [glitchColors, speed, fontSize]);

  return (
    <canvas 
      ref={canvasRef} 
      className={className} 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none', 
        zIndex: -1,
        opacity: 0.6
      }} 
    />
  );
}
