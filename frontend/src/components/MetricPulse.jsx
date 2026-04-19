import { motion } from 'framer-motion';

const MetricPulse = ({ 
  value, 
  label, 
  color = 'var(--primary-purple)', 
  maxValue = 100, 
  showLabel = true,
  height = '6px'
}) => {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div style={{ width: '100%', marginBottom: '0.75rem' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em' }}>
          <span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{label}</span>
          <span style={{ color: 'var(--text-strong)' }}>{value}{maxValue === 100 ? '%' : ''}</span>
        </div>
      )}
      <div style={{ 
        width: '100%', 
        height: height, 
        background: 'rgba(255,255,255,0.05)', 
        borderRadius: '10px', 
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid rgba(255,255,255,0.03)'
      }}>
        {/* Track Glow */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          boxShadow: `inset 0 0 5px ${color === 'var(--danger-red)' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(139, 92, 246, 0.1)'}`,
          pointerEvents: 'none'
        }} />

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "circOut" }}
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${color} 0%, var(--primary-blue) 100%)`,
            borderRadius: '10px',
            position: 'relative',
            boxShadow: `0 0 10px ${color}`
          }}
        >
          {/* Tip Pulse */}
          <motion.div 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              width: '4px',
              height: '100%',
              background: '#fff',
              filter: 'blur(2px)',
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default MetricPulse;
