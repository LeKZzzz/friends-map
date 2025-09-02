import React, { useState, useRef, useEffect } from 'react';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; count?: number }>;
  placeholder?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "选择选项"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [optionsPosition, setOptionsPosition] = useState({ top: 0, left: 0 });
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      setOptionsPosition({
        top: rect.top,
        left: rect.right + 8 // 8px间距
      });
    }
  }, [isOpen]);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className="custom-select" ref={selectRef}>
      <div 
        className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="custom-select-value">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={`custom-select-arrow ${isOpen ? 'open' : ''}`}>
          ▶
        </span>
      </div>
      
      {isOpen && (
        <div 
          className="custom-select-options"
          style={{
            top: `${optionsPosition.top}px`,
            left: `${optionsPosition.left}px`
          }}
        >
          {options.map((option) => (
            <div
              key={option.value}
              className={`custom-select-option ${option.value === value ? 'selected' : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;