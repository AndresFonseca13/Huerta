import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getProducts } from '../services/productService';
import CardCocktail from '../components/CardCocktail';
import CocktailDetailModal from '../components/CocktailDetailModal';
import CategoryFilterBar from '../components/CategoryFilterBar.jsx';
import { useTranslation } from 'react-i18next';

const FilteredCocktails = () => {
  const { t } = useTranslation();
  const { categoria } = useParams();
  const location = useLocation();
  const [cocktails, setCocktails] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedCocktail, setSelectedCocktail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const topRef = useRef(null);

  // Determinar el tipo basado en la ruta (soporta "/bebidas" y "/comida")
  const tipo = location.pathname.startsWith('/bebidas')
    ? 'destilado'
    : 'clasificacion';

  // Resetear a página 1 cuando cambia la categoría
  useEffect(() => {
    setCurrentPage(1);
  }, [categoria, tipo]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getProducts(currentPage, pageSize, categoria, tipo);
        const items = Array.isArray(data.cocteles) ? data.cocteles : [];
        const totalPages = data.paginacion?.totalPages || 0;
        const totalRecords = data.paginacion?.totalRecords || 0;
        setCocktails(items);
        setTotalPages(totalPages);
        setTotalRecords(totalRecords);
      } catch (_error) {
        // noop
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, pageSize, categoria, tipo]);

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

  const getFilterTitle = () => {
    if (!categoria) {
      return tipo === 'destilado'
        ? t('pageTitle.allCocktails')
        : t('pageTitle.allFood');
    }

    // Traducir categorías de comida
    if (tipo === 'clasificacion') {
      // Normalizar el nombre removiendo espacios y convirtiendo a minúsculas
      const normalizedName = categoria.toLowerCase().trim().replace(/\s+/g, '');

      // Mapear variaciones comunes de categorías
      const categoryMap = {
        entrada: 'entrada',
        entradas: 'entrada',
        fuerte: 'fuerte',
        fuertes: 'fuerte',
        platofuerte: 'fuerte',
        platosfuertes: 'fuerte',
        postre: 'postre',
        postres: 'postre',
        adiciones: 'adiciones',
        adicion: 'adiciones',
        acompañamientos: 'adiciones',
        acompañamiento: 'adiciones',
      };

      const mappedName = categoryMap[normalizedName] || normalizedName;
      const translationKey = `foodCategory.${mappedName}`;
      const translated = t(translationKey);

      // Si la traducción es igual a la clave, significa que no existe, usar nombre original
      return translated !== translationKey ? translated : categoria;
    }

    return categoria;
  };

  return (
    <div
      className="py-8"
      style={{ backgroundColor: '#191919', minHeight: '100vh' }}
    >
      <div ref={topRef} />
      <CategoryFilterBar />
      <div className="text-center mb-6 px-4">
        <h1
          className="text-2xl md:text-3xl lg:text-4xl uppercase mb-3 capitalize"
          style={{
            color: '#e9cc9e',
            fontFamily: '\'Playfair Display\', serif',
            fontWeight: '500',
            letterSpacing: '0.12em',
          }}
        >
          {getFilterTitle()}
        </h1>
        <p
          className="text-xs md:text-sm uppercase tracking-[0.15em] font-medium"
          style={{ color: '#5a5a4a' }}
        >
          {totalRecords > 0
            ? tipo === 'destilado'
              ? t('pageTitle.foundBeverages', { count: totalRecords })
              : t('pageTitle.foundDishes', { count: totalRecords })
            : t('pageTitle.noResults')}
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative w-16 h-16 mb-4">
            <div
              className="absolute inset-0 border-4 rounded-full animate-spin"
              style={{
                borderColor: '#3a3a3a',
                borderTopColor: '#e9cc9e',
              }}
            />
          </div>
          <p className="text-lg" style={{ color: '#b8b8b8' }}>
						Cargando...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 px-4 sm:px-8 max-w-[1100px] mx-auto">
          {cocktails.length === 0 ? (
            <div className="col-span-full text-center py-20 w-full">
              <p className="text-xl" style={{ color: '#b8b8b8' }}>
                {t('pageTitle.noResults')}
              </p>
            </div>
          ) : (
            cocktails.map((cocktail, index) => (
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
            ))
          )}
        </div>
      )}

      {!loading && totalPages > 0 && (
        <div className="flex flex-col items-center mt-8 mb-6 px-4 max-w-xl mx-auto">
          {/* Línea decorativa superior */}
          <div className="flex items-center gap-3 w-full mb-4">
            <div className="flex-1 h-px" style={{ backgroundColor: '#3a3a3a' }} />
            <span
              className="text-[10px] md:text-xs uppercase tracking-[0.25em] font-medium whitespace-nowrap"
              style={{ color: '#8a7a5a' }}
            >
              {cocktails.length} de {totalRecords}{' '}
              {tipo === 'destilado' ? 'bebidas' : 'platos'}
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#3a3a3a' }} />
          </div>

          {/* Navegación de páginas */}
          <nav className="flex items-center gap-1 md:gap-0">
            {/* Anterior */}
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              className="group relative px-3 md:px-4 py-2 text-base md:text-lg tracking-wide uppercase transition-all duration-300 disabled:opacity-30"
              style={{
                color: '#7a7a6a',
                fontWeight: '500',
                letterSpacing: '0.08em',
                background: 'transparent',
                border: 'none',
              }}
            >
              ‹
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] transition-all duration-300 opacity-0 group-hover:opacity-100"
                style={{ width: '40%', backgroundColor: '#5a5a4a' }}
              />
            </button>

            {/* Separador */}
            <span
              className="text-lg font-extralight select-none hidden md:inline"
              style={{ color: '#3a3a3a' }}
            >
              ·
            </span>

            {/* Números de página */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const isActive = page === currentPage;
              return (
                <React.Fragment key={page}>
                  <button
                    onClick={() => handlePageChange(page)}
                    className="group relative px-3 md:px-4 py-2 text-sm md:text-base transition-all duration-300"
                    style={{
                      color: isActive ? '#e9cc9e' : '#7a7a6a',
                      fontWeight: isActive ? '600' : '500',
                      letterSpacing: '0.08em',
                      background: 'transparent',
                      border: 'none',
                    }}
                  >
                    {page}
                    {/* Indicador inferior animado */}
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] transition-all duration-300"
                      style={{
                        width: isActive ? '50%' : '0%',
                        backgroundColor: '#e9cc9e',
                      }}
                    />
                    {!isActive && (
                      <span
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] transition-all duration-300 opacity-0 group-hover:opacity-100"
                        style={{ width: '30%', backgroundColor: '#5a5a4a' }}
                      />
                    )}
                  </button>
                  {page < totalPages && (
                    <span
                      className="text-lg font-extralight select-none hidden md:inline"
                      style={{ color: '#3a3a3a' }}
                    >
                      ·
                    </span>
                  )}
                </React.Fragment>
              );
            })}

            {/* Separador */}
            <span
              className="text-lg font-extralight select-none hidden md:inline"
              style={{ color: '#3a3a3a' }}
            >
              ·
            </span>

            {/* Siguiente */}
            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                handlePageChange(Math.min(currentPage + 1, totalPages))
              }
              className="group relative px-3 md:px-4 py-2 text-base md:text-lg tracking-wide uppercase transition-all duration-300 disabled:opacity-30"
              style={{
                color: '#7a7a6a',
                fontWeight: '500',
                letterSpacing: '0.08em',
                background: 'transparent',
                border: 'none',
              }}
            >
              ›
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] transition-all duration-300 opacity-0 group-hover:opacity-100"
                style={{ width: '40%', backgroundColor: '#5a5a4a' }}
              />
            </button>
          </nav>

          {/* Info de página */}
          <span
            className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium mt-2"
            style={{ color: '#5a5a4a' }}
          >
            Página {currentPage} de {totalPages}
          </span>
        </div>
      )}

      {/* Modal de detalles del cóctel */}
      <CocktailDetailModal
        cocktail={selectedCocktail}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default FilteredCocktails;
