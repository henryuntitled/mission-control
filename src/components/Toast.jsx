import { useState, useEffect } from 'react';

export function Toast({ message, type = 'error', onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' 
    ? 'bg-red-500/90 border-red-400' 
    : type === 'success' 
    ? 'bg-green-500/90 border-green-400'
    : 'bg-blue-500/90 border-blue-400';

  const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';

  return (
    <div
      className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg border text-white text-sm shadow-lg transition-all duration-300 ${bgColor} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <span>{icon}</span>
      <span>{message}</span>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-2 text-white/70 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
