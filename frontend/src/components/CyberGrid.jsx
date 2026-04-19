const CyberGrid = ({ 
  opacity = 0.05, 
  size = 20, 
  strokeWidth = 0.5,
  className = "" 
}) => {
  return (
    <div 
      className={`cyber-grid-container ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        opacity: opacity
      }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern 
            id="cyberGridPattern" 
            width={size} 
            height={size} 
            patternUnits="userSpaceOnUse"
          >
            <path 
              d={`M ${size} 0 L 0 0 0 ${size}`} 
              fill="none" 
              stroke="var(--primary-purple)" 
              strokeWidth={strokeWidth}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cyberGridPattern)" />
      </svg>
    </div>
  );
};

export default CyberGrid;
