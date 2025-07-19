import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiAlertTriangle } from "react-icons/fi";

const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative"
          initial={{ scale: 0.9, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 40 }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full p-2"
            aria-label="Cerrar modal"
          >
            <FiX size={20} />
          </button>
          <div className="flex flex-col items-center">
            <FiAlertTriangle className="text-yellow-500 text-4xl mb-2" />
            <h2 className="text-lg font-bold text-gray-800 mb-2 text-center">
              Confirmar acción
            </h2>
            <p className="text-gray-700 text-center mb-4">{message}</p>
            <div className="flex gap-4 mt-2">
              <button
                onClick={onClose}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmModal;
