import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
// import { motion } from "framer-motion";
import FloatingTypeSwitcher from './FloatingTypeSwitcher.jsx';
import {
  getAllCategories,
  getFoodCategories,
} from '../services/categoryService.js';
import { getProducts } from '../services/productService.js';
import { useTranslation } from 'react-i18next';

const CategoryFilterBar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { categoria } = useParams();

  // Determinar el tipo basado en la ruta actual
  const initialTipo = useMemo(() => {
    if (location.pathname.startsWith('/bebidas')) return 'destilado';
    if (location.pathname.startsWith('/comida')) return 'clasificacion';
    return 'destilado'; // predeterminado
  }, [location.pathname]);

  const [tipo, setTipo] = useState(initialTipo);
  const [allCategories, setAllCategories] = useState([]);
  const [categoriesWithProducts, setCategoriesWithProducts] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Estado eliminado por no uso para evitar warning de lint
  // const [isFabOpen, setIsFabOpen] = useState(false);

  useEffect(() => {
    setTipo(initialTipo);
  }, [initialTipo]);

  // Cargar categorías al montar y cuando cambie 'tipo'
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError('');
      try {
        let data;
        if (tipo === 'clasificacion') {
          data = await getFoodCategories();
          // Fallback por si el backend devuelve incompleto
          if (!Array.isArray(data) || data.length < 2) {
            const all = await getAllCategories(false);
            data = (Array.isArray(all) ? all : []).filter(
              (c) => c.type === 'clasificacion comida',
            );
          }
        } else {
          data = await getAllCategories(false);
        }
        setAllCategories(Array.isArray(data) ? data : []);
      } catch (_err) {
        setError(t('categoryFilter.error'));
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [tipo, t]);

  // Verificar qué categorías tienen productos con UNA sola llamada
  useEffect(() => {
    const checkCategoriesWithProducts = async () => {
      if (allCategories.length === 0) {
        setCategoriesWithProducts(new Set());
        return;
      }

      try {
        const productType = tipo === 'clasificacion' ? 'clasificacion' : tipo;
        // Una sola llamada con límite alto para obtener todos los productos del tipo
        const data = await getProducts(1, 200, null, productType);
        const products = Array.isArray(data.cocteles) ? data.cocteles : [];

        // Extraer nombres de categorías que aparecen en los productos
        const categoriesSet = new Set();
        products.forEach((product) => {
          if (Array.isArray(product.categories)) {
            product.categories.forEach((cat) => {
              if (cat?.name) categoriesSet.add(cat.name);
            });
          }
          // Campos directos que podrían indicar categoría
          if (product.destilado_name) categoriesSet.add(product.destilado_name);
          if (product.food_classification_name) categoriesSet.add(product.food_classification_name);
        });

        setCategoriesWithProducts(categoriesSet);
      } catch (_err) {
        // En caso de error, mostrar todas las categorías (mejor UX que no mostrar ninguna)
        const allNames = new Set(allCategories.map((c) => c.name));
        setCategoriesWithProducts(allNames);
      }
    };

    checkCategoriesWithProducts();
  }, [allCategories, tipo]);

  const categoriasFiltradas = useMemo(() => {
    // Primero filtrar por tipo
    let filtered = tipo === 'clasificacion' 
      ? allCategories.filter((c) => c.type === 'clasificacion comida')
      : allCategories.filter((c) => c.type === tipo);
		
    // Luego filtrar solo las que tienen productos asociados
    // Si categoriesWithProducts está vacío y ya cargamos las categorías, no mostrar ninguna
    // (esperando a que se verifiquen)
    if (allCategories.length > 0 && categoriesWithProducts.size === 0) {
      // Aún verificando, no mostrar ninguna categoría temporalmente
      return [];
    }
		
    // Filtrar solo las que tienen productos
    const finalFiltered = filtered.filter((c) => categoriesWithProducts.has(c.name));
		
    return finalFiltered;
  }, [allCategories, tipo, categoriesWithProducts]);

  const handleSelectCategoria = (nombreCategoria) => {
    if (!nombreCategoria) {
      navigate(tipo === 'destilado' ? '/bebidas' : '/comida');
      try {
        requestAnimationFrame(() => {
          if (document?.scrollingElement) {
            document.scrollingElement.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
      } catch (_err) {
        /* noop */
      }
      return;
    }
    navigate(
      tipo === 'destilado'
        ? `/bebidas/${nombreCategoria}`
        : `/comida/${nombreCategoria}`,
    );
    try {
      requestAnimationFrame(() => {
        if (document?.scrollingElement) {
          document.scrollingElement.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    } catch (_err) {
      /* noop */
    }
  };

  const isSelected = (name) => {
    return Boolean(categoria) && categoria === name;
  };

  const allIsActive =
    !categoria &&
    (location.pathname === '/bebidas' || location.pathname === '/comida');

  return (
    <div className="w-full flex flex-col gap-3 md:gap-4 items-center mb-4">
      {/* Botón flotante - ahora maneja su propia navegación */}
      <FloatingTypeSwitcher />

      {/* Filtros de categorías - estilo menú de bar */}
      <div className="w-full max-w-7xl px-4">
        {/* Línea decorativa superior */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px" style={{ backgroundColor: '#3a3a3a' }} />
          <span
            className="text-[10px] md:text-xs uppercase tracking-[0.25em] font-medium"
            style={{ color: '#8a7a5a' }}
          >
            {tipo === 'destilado' ? t('categoryFilter.allBeverages') : t('categoryFilter.allFood')}
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: '#3a3a3a' }} />
        </div>

        <nav
          className="flex flex-nowrap items-center gap-1 md:gap-0 overflow-x-auto scroll-smooth no-scrollbar justify-start md:justify-center"
          role="tablist"
          aria-label="Filtros por categoría"
        >
          {/* Botón "Todas" */}
          <button
            className="group relative flex-shrink-0 px-4 md:px-5 py-2.5 text-sm md:text-base tracking-wide transition-all duration-300 uppercase"
            style={{
              color: allIsActive ? '#e9cc9e' : '#7a7a6a',
              fontWeight: allIsActive ? '600' : '400',
              letterSpacing: '0.08em',
              background: 'transparent',
              border: 'none',
              WebkitAppearance: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
            onClick={() => handleSelectCategoria(null)}
            role="tab"
            aria-selected={allIsActive}
          >
            {t('categoryFilter.all')}
            {/* Indicador inferior animado */}
            <span
              className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] transition-all duration-300"
              style={{
                width: allIsActive ? '60%' : '0%',
                backgroundColor: '#e9cc9e',
              }}
            />
            {/* Hover glow sutil */}
            {!allIsActive && (
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] transition-all duration-300 opacity-0 group-hover:opacity-100"
                style={{
                  width: '40%',
                  backgroundColor: '#5a5a4a',
                }}
              />
            )}
          </button>

          {/* Separador */}
          <span
            className="flex-shrink-0 text-lg font-extralight select-none hidden md:inline"
            style={{ color: '#3a3a3a' }}
          >
            ·
          </span>

          {loading && (
            <span
              className="flex-shrink-0 text-xs uppercase tracking-widest"
              style={{ color: '#5a5a4a' }}
            >
              {t('categoryFilter.loading')}
            </span>
          )}
          {error && (
            <span className="flex-shrink-0 text-xs text-red-400/70">{error}</span>
          )}

          {!loading &&
            !error &&
            categoriasFiltradas.map((cat, index) => {
              const getCategoryLabel = (categoryName) => {
                if (tipo === 'clasificacion') {
                  const normalizedName = categoryName
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, '');

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

                  const mappedName =
                    categoryMap[normalizedName] || normalizedName;
                  const translationKey = `foodCategory.${mappedName}`;
                  const translated = t(translationKey);

                  return translated !== translationKey
                    ? translated
                    : categoryName;
                }
                return categoryName;
              };

              const active = isSelected(cat.name);

              return (
                <React.Fragment key={cat.id}>
                  <button
                    className="group relative flex-shrink-0 px-4 md:px-5 py-2.5 text-sm md:text-base capitalize tracking-wide transition-all duration-300"
                    style={{
                      color: active ? '#e9cc9e' : '#7a7a6a',
                      fontWeight: active ? '600' : '400',
                      letterSpacing: '0.08em',
                      background: 'transparent',
                      border: 'none',
                      WebkitAppearance: 'none',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    onClick={() => handleSelectCategoria(cat.name)}
                    role="tab"
                    aria-selected={active}
                  >
                    {getCategoryLabel(cat.name)}
                    {/* Indicador inferior animado */}
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] transition-all duration-300"
                      style={{
                        width: active ? '60%' : '0%',
                        backgroundColor: '#e9cc9e',
                      }}
                    />
                    {/* Hover glow sutil */}
                    {!active && (
                      <span
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] transition-all duration-300 opacity-0 group-hover:opacity-100"
                        style={{
                          width: '40%',
                          backgroundColor: '#5a5a4a',
                        }}
                      />
                    )}
                  </button>
                  {/* Separador entre items (excepto el último) */}
                  {index < categoriasFiltradas.length - 1 && (
                    <span
                      className="flex-shrink-0 text-lg font-extralight select-none hidden md:inline"
                      style={{ color: '#3a3a3a' }}
                    >
                      ·
                    </span>
                  )}
                </React.Fragment>
              );
            })}
        </nav>

        {/* Línea decorativa inferior */}
        <div
          className="mt-3 h-px w-full"
          style={{ backgroundColor: '#3a3a3a' }}
        />
      </div>
    </div>
  );
};

export default CategoryFilterBar;
