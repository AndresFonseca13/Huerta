import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiTag, FiType } from "react-icons/fi";

const CategoryModal = ({
  isOpen,
  onClose,
  onSave,
  initialData = {},
  modoEdicion = false,
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (modoEdicion && initialData) {
      setName(initialData.name || "");
      setType(initialData.type || "");
    } else {
      setName("");
      setType("");
    }
    setError("");
  }, [isOpen, initialData, modoEdicion]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!type.trim()) {
      setError("El tipo es obligatorio");
      return;
    }
    onSave({ name: name.trim(), type: type.trim() });
  };

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
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            {modoEdicion ? "Editar Categoría" : "Crear Nueva Categoría"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiTag className="inline mr-1 text-green-600" /> Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                placeholder="Nombre de la categoría"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiType className="inline mr-1 text-blue-600" /> Tipo
              </label>
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Tipo de la categoría"
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              {modoEdicion ? "Guardar Cambios" : "Crear Categoría"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CategoryModal;
