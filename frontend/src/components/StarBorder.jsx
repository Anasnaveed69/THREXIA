import { motion } from 'framer-motion';
import './StarBorder.css';

const StarBorder = ({
  as: Component = 'button',
  className = '',
  color = 'var(--primary-purple)',
  speed = '6s',
  thickness = 1,
  children,
  innerClassName = '',
  innerStyle = {},
  ...rest
}) => {
  const MotionComponent = motion(Component);

  return (
    <MotionComponent
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`star-border-container ${className}`}
      style={{
        padding: `${thickness}px`,
        ...rest.style
      }}
      {...rest}
    >
      <div
        className="border-gradient-bottom"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed
        }}
      ></div>
      <div
        className="border-gradient-top"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed
        }}
      ></div>
      <div className={`inner-content ${innerClassName}`} style={innerStyle}>{children}</div>
    </MotionComponent>
  );
};

export default StarBorder;
