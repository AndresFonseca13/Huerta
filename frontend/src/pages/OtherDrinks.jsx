import React, { useEffect, useRef, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { getProducts } from '../services/productService';
import {
  getBeverageCategories,
  getAllCategories,
} from '../services/categoryService';
import FloatingTypeSwitcher from '../components/FloatingTypeSwitcher';
import { useTranslation } from 'react-i18next';
import { useProductsTranslation } from '../hooks/useProductTranslation';

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .trim();

const currency = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

const OtherDrinks = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filter, setFilter] = useState('todos');
  const [subFilter, setSubFilter] = useState(null);
  const [beverageCategories, setBeverageCategories] = useState([]);
  const [wineSubcategories, setWineSubcategories] = useState([]);
  const [destiladoSubcategories, setDestiladoSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesWithProducts, setCategoriesWithProducts] = useState(new Set());
  const [wineSubcatsWithProducts, setWineSubcatsWithProducts] = useState(new Set());
  const [destiladoSubcatsWithProducts, setDestiladoSubcatsWithProducts] = useState(new Set());
  const topRef = useRef(null);

  // Traducir productos
  const { translatedProducts } = useProductsTranslation(items);

  // Cargar categorías de bebidas al montar
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getBeverageCategories();
        setBeverageCategories(Array.isArray(cats) ? cats : []);

        // Cargar todas las categorías para subfiltros
        const allCats = await getAllCategories(false);

        // Subcategorías de vino (type = 'vino')
        const wineSubs = (Array.isArray(allCats) ? allCats : []).filter(
          (c) => normalize(c.type) === 'vino',
        );
        setWineSubcategories(wineSubs);

        // Subcategorías de destilados (type = 'destilado')
        const destiladoSubs = (Array.isArray(allCats) ? allCats : []).filter(
          (c) => normalize(c.type) === 'destilado',
        );
        setDestiladoSubcategories(destiladoSubs);
      } catch (_e) {
        setBeverageCategories([]);
        setWineSubcategories([]);
        setDestiladoSubcategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Verificar qué categorías principales tienen productos
  useEffect(() => {
    const checkCategoriesWithProducts = async () => {
      if (beverageCategories.length === 0) return;

      try {
        const categoriesSet = new Set();

        // Verificar cada categoría individualmente
        const checkPromises = beverageCategories.map(async (category) => {
          try {
            const data = await getProducts(1, 1, normalize(category.name), null);
            const products = Array.isArray(data.cocteles) ? data.cocteles : [];
            const totalRecords = data.paginacion?.totalRecords || 0;

            // Excluir comida y cócteles
            const others = products.filter((p) => {
              const hasFood = p.categories?.some(
                (c) => normalize(c.type) === 'clasificacion comida',
              );
              const isCocktail = p.categories?.some(
                (c) =>
                  normalize(c.name) === 'cocktail' &&
									normalize(c.type) === 'clasificacion',
              );
              return !hasFood && !isCocktail;
            });

            if (totalRecords > 0 || others.length > 0) {
              return normalize(category.name);
            }
            return null;
          } catch (_err) {
            return null;
          }
        });

        const results = await Promise.all(checkPromises);
        results.forEach((categoryName) => {
          if (categoryName) {
            categoriesSet.add(categoryName);
          }
        });

        setCategoriesWithProducts(categoriesSet);
      } catch (_err) {
        setCategoriesWithProducts(new Set());
      }
    };

    checkCategoriesWithProducts();
  }, [beverageCategories]);

  // Verificar qué subcategorías de vino tienen productos
  useEffect(() => {
    const checkWineSubcategories = async () => {
      if (wineSubcategories.length === 0) return;

      try {
        const categoriesSet = new Set();

        const checkPromises = wineSubcategories.map(async (category) => {
          try {
            const data = await getProducts(1, 1, normalize(category.name), null);
            const products = Array.isArray(data.cocteles) ? data.cocteles : [];
            const totalRecords = data.paginacion?.totalRecords || 0;

            const others = products.filter((p) => {
              const hasFood = p.categories?.some(
                (c) => normalize(c.type) === 'clasificacion comida',
              );
              const isCocktail = p.categories?.some(
                (c) =>
                  normalize(c.name) === 'cocktail' &&
									normalize(c.type) === 'clasificacion',
              );
              return !hasFood && !isCocktail;
            });

            if (totalRecords > 0 || others.length > 0) {
              return normalize(category.name);
            }
            return null;
          } catch (_err) {
            return null;
          }
        });

        const results = await Promise.all(checkPromises);
        results.forEach((categoryName) => {
          if (categoryName) {
            categoriesSet.add(categoryName);
          }
        });

        setWineSubcatsWithProducts(categoriesSet);
      } catch (_err) {
        setWineSubcatsWithProducts(new Set());
      }
    };

    checkWineSubcategories();
  }, [wineSubcategories]);

  // Verificar qué subcategorías de destilados tienen productos
  useEffect(() => {
    const checkDestiladoSubcategories = async () => {
      if (destiladoSubcategories.length === 0) return;

      try {
        const categoriesSet = new Set();

        const checkPromises = destiladoSubcategories.map(async (category) => {
          try {
            const data = await getProducts(1, 1, normalize(category.name), null);
            const products = Array.isArray(data.cocteles) ? data.cocteles : [];
            const totalRecords = data.paginacion?.totalRecords || 0;

            const others = products.filter((p) => {
              const hasFood = p.categories?.some(
                (c) => normalize(c.type) === 'clasificacion comida',
              );
              const isCocktail = p.categories?.some(
                (c) =>
                  normalize(c.name) === 'cocktail' &&
									normalize(c.type) === 'clasificacion',
              );
              return !hasFood && !isCocktail;
            });

            if (totalRecords > 0 || others.length > 0) {
              return normalize(category.name);
            }
            return null;
          } catch (_err) {
            return null;
          }
        });

        const results = await Promise.all(checkPromises);
        results.forEach((categoryName) => {
          if (categoryName) {
            categoriesSet.add(categoryName);
          }
        });

        setDestiladoSubcatsWithProducts(categoriesSet);
      } catch (_err) {
        setDestiladoSubcatsWithProducts(new Set());
      }
    };

    checkDestiladoSubcategories();
  }, [destiladoSubcategories]);

  // Resetear a página 1 cuando cambia el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, subFilter]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Si hay subfiltro activo, usar ese; si no, usar el filtro principal
        const categoria = subFilter || (filter !== 'todos' ? filter : null);

        // Traemos más registros para poder filtrar correctamente las "otras bebidas"
        // ya que necesitamos excluir comida y cócteles
        const fetchSize = categoria ? pageSize : 100;
        const data = await getProducts(1, fetchSize, categoria, null);
        const list = Array.isArray(data.cocteles) ? data.cocteles : [];

        // Excluir comida (clasificacion comida) y cocteles (clasificacion 'cocktail')
        const others = list.filter((p) => {
          const hasFood = p.categories?.some(
            (c) => normalize(c.type) === 'clasificacion comida',
          );
          const isCocktail = p.categories?.some(
            (c) =>
              normalize(c.name) === 'cocktail' &&
							normalize(c.type) === 'clasificacion',
          );
          return !hasFood && !isCocktail;
        });

        // Paginación en cliente
        const totalFiltered = others.length;
        const totalPgs = Math.max(1, Math.ceil(totalFiltered / pageSize));
        const startIdx = (currentPage - 1) * pageSize;
        const endIdx = startIdx + pageSize;
        const paginated = others.slice(startIdx, endIdx);

        setItems(paginated);
        setTotalRecords(totalFiltered);
        setTotalPages(totalPgs);
      } catch (_e) {
        setItems([]);
        setTotalPages(0);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, pageSize, filter, subFilter]);

  // Los items ya vienen filtrados del backend, usar productos traducidos
  const filteredItems = translatedProducts;

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    try {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (_e) {
      /* noop */
    }
  };

  return (
    <div
      className="py-8"
      style={{ backgroundColor: '#191919', minHeight: '100vh' }}
    >
      {/* Botón flotante de navegación */}
      <FloatingTypeSwitcher />

      <div ref={topRef} />
      <motion.div
        className="text-center mb-6 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1
          className="text-3xl md:text-4xl font-bold mb-2"
          style={{ color: '#e9cc9e' }}
        >
          {t('pageTitle.otherDrinks')}
        </h1>
        <p className="text-gray-400">
          {totalRecords > 0
            ? t('pageTitle.foundBeverages', { count: totalRecords })
            : t('pageTitle.noResults')}
        </p>
      </motion.div>

      {/* Filtros principales */}
      <div className="w-full max-w-7xl mx-auto px-4 mb-4">
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar">
          {/* Filtro "Todos" siempre presente */}
          <button
            className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm md:text-base transition-all shadow-sm ${
              filter === 'todos'
                ? 'border-[#e9cc9e] text-[#191919]'
                : 'bg-[#2a2a2a] text-[#e9cc9e] border-[#3a3a3a] hover:bg-[#3a3a3a]'
            }`}
            style={filter === 'todos' ? { backgroundColor: '#e9cc9e' } : {}}
            onClick={() => {
              setFilter('todos');
              setSubFilter(null);
              setCurrentPage(1);
            }}
          >
            {t('categoryFilter.all')}
          </button>
          {/* Filtros dinámicos desde categorías de clasificacion bebida - solo las que tienen productos */}
          {beverageCategories
            .filter((cat) => {
              // Si aún no se han verificado las categorías, mostrar todas temporalmente
              if (categoriesWithProducts.size === 0 && beverageCategories.length > 0) {
                return false;
              }
              // Filtrar solo las que tienen productos
              return categoriesWithProducts.has(normalize(cat.name));
            })
            .map((cat) => (
              <button
                key={cat.id}
                className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm md:text-base transition-all shadow-sm capitalize ${
                  filter === normalize(cat.name)
                    ? 'border-[#e9cc9e] text-[#191919]'
                    : 'bg-[#2a2a2a] text-[#e9cc9e] border-[#3a3a3a] hover:bg-[#3a3a3a]'
                }`}
                style={
                  filter === normalize(cat.name)
                    ? { backgroundColor: '#e9cc9e' }
                    : {}
                }
                onClick={() => {
                  setFilter(normalize(cat.name));
                  setSubFilter(null);
                  setCurrentPage(1);
                }}
              >
                {cat.name}
              </button>
            ))}
        </div>
      </div>

      {/* Subfiltros de vino */}
      {filter === 'vino' && 
				wineSubcategories.filter((cat) => {
				  if (wineSubcatsWithProducts.size === 0 && wineSubcategories.length > 0) {
				    return false;
				  }
				  return wineSubcatsWithProducts.has(normalize(cat.name));
				}).length > 0 && (
        <div className="w-full max-w-7xl mx-auto px-4 mb-4">
          <p
            className="text-xs mb-2 px-1"
            style={{ color: '#e9cc9e', opacity: 0.7 }}
          >
						Tipos de vino:
          </p>
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-xs md:text-sm transition-all ${
                !subFilter
                  ? 'border-[#e9cc9e] text-[#191919]'
                  : 'bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a]'
              }`}
              style={
                !subFilter
                  ? { backgroundColor: '#e9cc9e' }
                  : { color: '#e9cc9e' }
              }
              onClick={() => {
                setSubFilter(null);
                setCurrentPage(1);
              }}
            >
              {t('categoryFilter.allWines')}
            </button>
            {wineSubcategories
              .filter((cat) => {
                if (wineSubcatsWithProducts.size === 0 && wineSubcategories.length > 0) {
                  return false;
                }
                return wineSubcatsWithProducts.has(normalize(cat.name));
              })
              .map((cat) => (
                <button
                  key={cat.id}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-xs md:text-sm transition-all capitalize ${
                    subFilter === normalize(cat.name)
                      ? 'border-[#e9cc9e] text-[#191919]'
                      : 'bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a]'
                  }`}
                  style={
                    subFilter === normalize(cat.name)
                      ? { backgroundColor: '#e9cc9e' }
                      : { color: '#e9cc9e' }
                  }
                  onClick={() => {
                    setSubFilter(normalize(cat.name));
                    setCurrentPage(1);
                  }}
                >
                  {cat.name}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Subfiltros de botellas - mostrar destilados */}
      {filter === 'botellas' && 
				destiladoSubcategories.filter((cat) => {
				  if (destiladoSubcatsWithProducts.size === 0 && destiladoSubcategories.length > 0) {
				    return false;
				  }
				  return destiladoSubcatsWithProducts.has(normalize(cat.name));
				}).length > 0 && (
        <div className="w-full max-w-7xl mx-auto px-4 mb-4">
          <p
            className="text-xs mb-2 px-1"
            style={{ color: '#e9cc9e', opacity: 0.7 }}
          >
						Tipo de destilado:
          </p>
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-xs md:text-sm transition-all ${
                !subFilter
                  ? 'border-[#e9cc9e] text-[#191919]'
                  : 'bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a]'
              }`}
              style={
                !subFilter
                  ? { backgroundColor: '#e9cc9e' }
                  : { color: '#e9cc9e' }
              }
              onClick={() => {
                setSubFilter(null);
                setCurrentPage(1);
              }}
            >
							Todas las botellas
            </button>
            {destiladoSubcategories
              .filter((cat) => {
                if (destiladoSubcatsWithProducts.size === 0 && destiladoSubcategories.length > 0) {
                  return false;
                }
                return destiladoSubcatsWithProducts.has(normalize(cat.name));
              })
              .map((cat) => (
                <button
                  key={cat.id}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-xs md:text-sm transition-all capitalize ${
                    subFilter === normalize(cat.name)
                      ? 'border-[#e9cc9e] text-[#191919]'
                      : 'bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a]'
                  }`}
                  style={
                    subFilter === normalize(cat.name)
                      ? { backgroundColor: '#e9cc9e' }
                      : { color: '#e9cc9e' }
                  }
                  onClick={() => {
                    setSubFilter(normalize(cat.name));
                    setCurrentPage(1);
                  }}
                >
                  {cat.name}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Subfiltros de tragos - mostrar destilados */}
      {filter === 'tragos' && 
				destiladoSubcategories.filter((cat) => {
				  if (destiladoSubcatsWithProducts.size === 0 && destiladoSubcategories.length > 0) {
				    return false;
				  }
				  return destiladoSubcatsWithProducts.has(normalize(cat.name));
				}).length > 0 && (
        <div className="w-full max-w-7xl mx-auto px-4 mb-4">
          <p
            className="text-xs mb-2 px-1"
            style={{ color: '#e9cc9e', opacity: 0.7 }}
          >
						Tipo de destilado:
          </p>
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-xs md:text-sm transition-all ${
                !subFilter
                  ? 'border-[#e9cc9e] text-[#191919]'
                  : 'bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a]'
              }`}
              style={
                !subFilter
                  ? { backgroundColor: '#e9cc9e' }
                  : { color: '#e9cc9e' }
              }
              onClick={() => {
                setSubFilter(null);
                setCurrentPage(1);
              }}
            >
              {t('categoryFilter.allDrinks')}
            </button>
            {destiladoSubcategories
              .filter((cat) => {
                if (destiladoSubcatsWithProducts.size === 0 && destiladoSubcategories.length > 0) {
                  return false;
                }
                return destiladoSubcatsWithProducts.has(normalize(cat.name));
              })
              .map((cat) => (
                <button
                  key={cat.id}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-xs md:text-sm transition-all capitalize ${
                    subFilter === normalize(cat.name)
                      ? 'border-[#e9cc9e] text-[#191919]'
                      : 'bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a]'
                  }`}
                  style={
                    subFilter === normalize(cat.name)
                      ? { backgroundColor: '#e9cc9e' }
                      : { color: '#e9cc9e' }
                  }
                  onClick={() => {
                    setSubFilter(normalize(cat.name));
                    setCurrentPage(1);
                  }}
                >
                  {cat.name}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Listado */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-4 max-w-6xl mx-auto">
          {filteredItems.length === 0 ? (
            <div className="col-span-2 text-center py-20">
              <p className="text-xl" style={{ color: '#b8b8b8' }}>
                {t('pageTitle.noResults')}
              </p>
            </div>
          ) : (
            filteredItems.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border shadow-sm hover:shadow-lg transition-all p-4 md:p-5"
                style={{
                  backgroundColor: '#2a2a2a',
                  borderColor: '#3a3a3a',
                }}
              >
                {/* Sección superior: Imagen horizontal + Info */}
                <div className="flex gap-4">
                  {/* Imagen - object-contain para no cortar botellas */}
                  {p.images?.[0] && (
                    <div
                      className="flex-shrink-0 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: '#1a1a1a' }}
                    >
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-24 h-32 md:w-28 md:h-36 object-contain"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Info principal: Nombre y Precio */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3
                      className="text-lg md:text-xl font-bold capitalize mb-2"
                      style={{ color: '#e9cc9e' }}
                    >
                      {p.name}
                    </h3>
                    <div
                      className="text-xl md:text-2xl font-bold mb-2"
                      style={{ color: '#e9cc9e' }}
                    >
                      {currency(p.price)}
                    </div>

                    {/* Porcentaje de alcohol si existe */}
                    {p.alcohol_percentage && (
                      <span
                        className="inline-block px-2 py-0.5 text-xs font-semibold rounded w-fit"
                        style={{ backgroundColor: '#e9cc9e', color: '#191919' }}
                      >
                        {p.alcohol_percentage}% Vol.
                      </span>
                    )}
                  </div>
                </div>

                {/* Descripción */}
                {p.description && (
                  <p
                    className="text-sm line-clamp-2 mt-3 mb-3"
                    style={{ color: '#b8b8b8' }}
                  >
                    {p.description}
                  </p>
                )}

                {/* Categorías */}
                {p.categories && p.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {p.categories
                      .filter((cat) => cat.type === 'clasificacion bebida')
                      .slice(0, 4)
                      .map((cat, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2.5 py-1 text-xs font-medium rounded-full border capitalize"
                          style={{
                            backgroundColor: '#3a3a3a',
                            color: '#e9cc9e',
                            borderColor: '#4a4a4a',
                          }}
                        >
                          {cat.name}
                        </span>
                      ))}
                    {p.categories.filter(
                      (cat) => cat.type === 'clasificacion bebida',
                    ).length > 4 && (
                      <span
                        className="inline-block px-2.5 py-1 text-xs font-medium rounded-full"
                        style={{ backgroundColor: '#3a3a3a', color: '#b8b8b8' }}
                      >
										+
                        {p.categories.filter(
                          (cat) => cat.type === 'clasificacion bebida',
                        ).length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )))}
        </div>
      )}

      {/* Paginación */}
      {!loading && totalPages > 0 && (
        <div className="flex justify-center items-center space-x-2 mt-6 mb-8">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            className="px-4 py-2 rounded-lg disabled:opacity-50 transition-all"
            style={{
              color: '#e9cc9e',
              backgroundColor: '#2a2a2a',
              border: '1px solid #3a3a3a',
            }}
          >
						‹ Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 rounded-lg transition-all ${
                page === currentPage ? 'font-bold' : ''
              }`}
              style={
                page === currentPage
                  ? { backgroundColor: '#e9cc9e', color: '#191919' }
                  : {
                    backgroundColor: '#2a2a2a',
                    color: '#e9cc9e',
                    border: '1px solid #3a3a3a',
									  }
              }
            >
              {page}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() =>
              handlePageChange(Math.min(currentPage + 1, totalPages))
            }
            className="px-4 py-2 rounded-lg disabled:opacity-50 transition-all"
            style={{
              color: '#e9cc9e',
              backgroundColor: '#2a2a2a',
              border: '1px solid #3a3a3a',
            }}
          >
						Siguiente ›
          </button>
        </div>
      )}
    </div>
  );
};

export default OtherDrinks;
