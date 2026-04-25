import React from 'react';
import './CyberButton.css';

const CyberButton = ({ children, onClick, className = '', style = {}, as: Component = 'button', ...props }) => {
  return (
    <div className={`cyber-button-wrapper ${className}`} style={style}>
      <Component className="cyber-button" onClick={onClick} {...props}>
        <span className="cyber-button-text">{children}</span>
      </Component>
    </div>
  );
};

export default CyberButton;
