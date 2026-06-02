import React from 'react';

interface BpmControlProps {
  value: number;
  onChange: (newBpm: number) => void;
  disabled?: boolean;
}

export const BpmControl: React.FC<BpmControlProps> = ({ value, onChange, disabled = false }) => {
  const presets = [40, 60, 80, 100, 120];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      onChange(Math.max(30, Math.min(150, val)));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      // Allow user to type, but clamp values on blur or validation if necessary.
      // For real-time typing, we can let them type, but cap it.
      onChange(val);
    } else if (e.target.value === '') {
      onChange(30); // fallback or empty
    }
  };

  const handleBlur = () => {
    // Force clamp to range [30, 150] when focus leaves
    const clamped = Math.max(30, Math.min(150, value));
    onChange(clamped);
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '16px 20px',
      border: '1px solid rgba(99, 102, 241, 0.15)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      width: '100%',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
      opacity: disabled ? 0.6 : 1,
      pointerEvents: disabled ? 'none' : 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>⚡</span>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#2d3436' }}>연주 템포 설정 (BPM)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="number"
            value={value || ''}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={disabled}
            style={{
              width: '60px',
              padding: '6px 8px',
              borderRadius: '8px',
              border: '1.5px solid rgba(99, 102, 241, 0.3)',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'var(--primary-color)',
              outline: 'none',
              background: '#ffffff',
              transition: 'border-color 0.2s ease',
            }}
          />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#636e72' }}>BPM</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#b2bec3', width: '20px' }}>30</span>
        <input
          type="range"
          min="30"
          max="150"
          value={value}
          onChange={handleSliderChange}
          disabled={disabled}
          style={{
            flex: 1,
            height: '6px',
            borderRadius: '3px',
            outline: 'none',
            WebkitAppearance: 'none',
            background: 'linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ' + ((value - 30) / 120 * 100) + '%, #dfe6e9 ' + ((value - 30) / 120 * 100) + '%, #dfe6e9 100%)',
            cursor: 'pointer',
          }}
        />
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#b2bec3', width: '25px', textAlign: 'right' }}>150</span>
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', marginTop: '4px' }}>
        {presets.map((preset) => {
          const isSelected = value === preset;
          return (
            <button
              key={preset}
              onClick={() => onChange(preset)}
              disabled={disabled}
              style={{
                flex: 1,
                padding: '6px 0',
                borderRadius: '8px',
                border: isSelected ? '1px solid var(--primary-color)' : '1px solid #dfe6e9',
                background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'white',
                color: isSelected ? 'var(--primary-color)' : '#636e72',
                fontSize: '0.78rem',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {preset}
            </button>
          );
        })}
      </div>
    </div>
  );
};
