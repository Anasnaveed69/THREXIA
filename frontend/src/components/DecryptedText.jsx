import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function DecryptedText({ 
  text, 
  speed = 50, 
  maxIterations = 10, 
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+",
  className = "",
  animateOn = "view", // "view" or "hover"
  revealDirection = "start", // "start", "end", "center"
  style = {}
}) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  const intervalRef = useRef(null);

  const startAnimation = () => {
    let iteration = 0;
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText((prev) => 
        text
          .split("")
          .map((char, index) => {
            if (index < iteration) {
              return text[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(intervalRef.current);
        setHasRevealed(true);
      }

      iteration += 1 / maxIterations;
    }, speed);
  };

  useEffect(() => {
    if (animateOn === "view" && !hasRevealed) {
      startAnimation();
    }
    return () => clearInterval(intervalRef.current);
  }, [text]);

  const handleMouseEnter = () => {
    if (animateOn === "hover") {
      setIsHovered(true);
      startAnimation();
    }
  };

  return (
    <motion.span 
      className={className} 
      onMouseEnter={handleMouseEnter}
      style={{ display: 'inline-block', whiteSpace: 'pre', ...style }}
    >
      {displayText}
    </motion.span>
  );
}
