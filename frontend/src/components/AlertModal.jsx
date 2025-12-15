import React from 'react';
import { AnimatePresence } from 'framer-motion';

const AlertModal = ({
  isOpen = true,
  title = 'Aviso',
  message,
  items = [],
  onClose,
  tone = 'amber',
}) => {
  const tones = {
    amber: {
      bg: 'bg-amber-50',
      fg: 'text-amber-600',
      iconBg: 'bg-amber-100',
    },
    red: {
      bg: 'bg-red-50',
      fg: 'text-red-600',
      iconBg: 'bg-red-100',
    },
  };
  const t = tones[tone] || tones.amber;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose?.();
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                aria-label="Cerrar"
              >
								✕
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div
                className={`w-12 h-12 rounded-full ${t.iconBg} ${t.fg} inline-flex items-center justify-center`}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M12 7v6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="16.5" r="1" fill="currentColor" />
                </svg>
              </div>
              {message && (
                <p className="text-gray-700 leading-relaxed">{message}</p>
              )}
              {items.length > 0 && (
                <ul className="list-disc list-inside text-gray-800 space-y-1">
                  {items.map((it, idx) => (
                    <li key={idx}>{it}</li>
                  ))}
                </ul>
              )}
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-md bg-green-700 text-white hover:bg-green-800"
                >
									Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AlertModal;
