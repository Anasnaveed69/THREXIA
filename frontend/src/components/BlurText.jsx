import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const BlurText = ({
  text = '',
  delay = 0.04,
  className = '',
  animateBy = 'words', // 'words' or 'letters'
  direction = 'top', // 'top' or 'bottom'
  threshold = 0.1,
  rootMargin = '0px',
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current);
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: delay,
      }
    }
  };

  const childVariants = {
    hidden: { 
      filter: 'blur(10px)', 
      opacity: 0, 
      y: direction === 'top' ? -20 : 20 
    },
    visible: { 
      filter: 'blur(0px)', 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "circOut"
      }
    }
  };

  return (
    <motion.div 
      ref={ref} 
      className={`blur-text ${className}`} 
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}
    >
      {elements.map((element, index) => (
        <motion.span
          key={index}
          variants={childVariants}
          style={{
            display: 'inline-block',
            marginRight: animateBy === 'words' ? '0.35em' : '0',
          }}
        >
          {element === '' ? '\u00A0' : element}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default BlurText;
