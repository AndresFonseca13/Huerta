import React, { useEffect, useState, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts } from '../services/productService';
import CardCocktail from '../components/CardCocktail';
import CocktailDetailModal from '../components/CocktailDetailModal';

const Home = () => {
  const [cocktails, setCocktails] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedCocktail, setSelectedCocktail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const topRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getProducts(currentPage, pageSize);
        const { cocteles, paginacion } = response;

        setCocktails(cocteles);
        setTotalPages(paginacion.totalPages);
        setTotalRecords(paginacion.totalRecords);
      } catch (error) {
        console.error('Error fetching cocktails:', error);
      }
    };

    fetchData();
  }, [currentPage, pageSize]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll suave hacia arriba con animación
    topRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleCardClick = (cocktail) => {
    setSelectedCocktail(cocktail);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCocktail(null);
  };

  return (
    <>
      <div ref={topRef} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-6 max-w-[1600px] mx-auto">
        {cocktails.map((cocktail, index) => (
          <div
            key={cocktail.id}
            className="animate-fade-in"
            style={{
              opacity: 1,
              animationDelay: `${index * 0.05}s`,
            }}
          >
            <CardCocktail cocktail={cocktail} onClick={handleCardClick} />
          </div>
        ))}
      </div>

      <motion.div
        className="flex flex-col items-center mt-4 space-y-2 mb-4"
        initial={{ opacity: 1, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="text-sm text-gray-600">
					Mostrando {cocktails.length} de {totalRecords} cocteles (Página{' '}
          {currentPage} de {totalPages})
        </div>
        <div className="flex justify-center space-x-2 overflow-x-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={currentPage === 1}
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            className="px-3 py-1 rounded disabled:opacity-50 text-black transition-colors"
          >
						‹ Anterior
          </motion.button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <motion.button
              key={page}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded transition-colors ${
                page === currentPage ? 'bg-green-700 text-white' : ''
              }`}
            >
              {page}
            </motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={currentPage === totalPages}
            onClick={() =>
              handlePageChange(Math.min(currentPage + 1, totalPages))
            }
            className="px-3 py-1 rounded disabled:opacity-50 text-black transition-colors"
          >
						Siguiente ›
          </motion.button>
        </div>
      </motion.div>

      {/* Modal de detalles del cóctel */}
      <CocktailDetailModal
        cocktail={selectedCocktail}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default Home;
