import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const BackButton = ({ className = "" }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className={`flex items-center text-gray-600 hover:text-green-700 font-semibold px-3 py-2 rounded transition-colors bg-gray-100 hover:bg-green-50 shadow-sm ${className}`}
    >
      <FiChevronLeft className="mr-2" size={20} /> Volver
    </button>
  );
};

export default BackButton;
