import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import logo from '../assets/Logo Huerta.webp';
import LanguageSwitcher from './LanguageSwitcher';

// --- Componente Principal de la Barra de Navegación ---
const Navbar = () => {
  const navigate = useNavigate();

  // Eliminado manejo de scroll por menú móvil

  // --- Navegación simple ---

  // Variantes del menú móvil eliminadas

  // --- JSX del Componente ---

  return (
    <header
      className="shadow-lg sticky top-0 z-40"
      style={{ backgroundColor: '#121212', borderBottom: '1px solid #3a3a3a' }}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 flex items-center justify-between h-16 sm:h-20">
        {/* Logo */}
        <Motion.div
          whileHover={{ scale: 1.05 }}
          className="cursor-pointer flex items-center gap-x-2 sm:gap-x-3 md:gap-x-4 flex-1 min-w-0"
          onClick={() => navigate('/')}
        >
          <img
            src={logo}
            alt="Logo Huerta"
            className="h-14 sm:h-16 md:h-20 lg:h-24 w-auto object-contain block flex-shrink-0"
            style={{ objectPosition: 'center' }}
          />
          <h1
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-wider flex items-center truncate"
            style={{
              fontFamily: '\'Playfair Display\', serif',
              color: '#e9cc9e',
            }}
          >
						Huerta
          </h1>
        </Motion.div>

        {/* Selector de idioma */}
        <div className="flex-shrink-0 ml-2">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Sin panel de menú móvil */}
    </header>
  );
};

export default Navbar;
