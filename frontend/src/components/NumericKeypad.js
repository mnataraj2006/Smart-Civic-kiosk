import React from 'react';

const NumericKeypad = ({ value, onChange, maxLength = 10 }) => {
  const handleKey = (key) => {
    if (key === 'DEL') {
      onChange(value.slice(0, -1));
    } else if (key === 'CLR') {
      onChange('');
    } else if (value.length < maxLength) {
      onChange(value + key);
    }
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', 'DEL'];

  return (
    <div className="numeric-keypad">
      {keys.map((key) => (
        <button
          key={key}
          className={`key-btn ${key === 'DEL' ? 'delete' : ''} ${key === 'CLR' ? 'clear' : ''}`}
          onClick={() => handleKey(key)}
          id={`key-${key}`}
        >
          {key === 'DEL' ? '⌫' : key === 'CLR' ? 'Clear' : key}
        </button>
      ))}
    </div>
  );
};

export default NumericKeypad;
