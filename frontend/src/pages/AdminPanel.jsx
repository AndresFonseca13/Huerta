import React from "react";
import { useNavigate } from "react-router-dom";
import { FiList, FiTag, FiUser, FiBox, FiLogOut } from "react-icons/fi";
import { logout } from "../services/authService";

const AdminPanel = () => {
  const navigate = useNavigate();

  const handleGoToCocktails = () => {
    navigate("/admin/cocktails");
  };

  const handleGoToCategories = () => {
    navigate("/admin/categories");
  };

  // Futuro: productos, ingredientes, usuarios

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 text-center">
          Panel de Administración
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          Selecciona una sección para gestionar
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
          <button
            onClick={handleGoToCocktails}
            className="flex flex-col items-center justify-center bg-green-100 hover:bg-green-200 text-green-800 font-semibold py-6 rounded-xl shadow transition-colors"
          >
            <FiList size={32} className="mb-2" />
            Cócteles
          </button>
          <button
            onClick={handleGoToCategories}
            className="flex flex-col items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-6 rounded-xl shadow transition-colors"
          >
            <FiTag size={32} className="mb-2" />
            Categorías
          </button>
          {/* Futuro: productos, ingredientes, usuarios */}
          <button
            disabled
            className="flex flex-col items-center justify-center bg-gray-100 text-gray-400 font-semibold py-6 rounded-xl shadow cursor-not-allowed"
          >
            <FiBox size={32} className="mb-2" />
            Productos
          </button>
          <button
            disabled
            className="flex flex-col items-center justify-center bg-gray-100 text-gray-400 font-semibold py-6 rounded-xl shadow cursor-not-allowed"
          >
            <FiUser size={32} className="mb-2" />
            Usuarios
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center bg-red-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-red-700 transition-colors"
        >
          <FiLogOut className="mr-2" /> Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
