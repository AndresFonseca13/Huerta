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

  // Verificar qué categorías y subcategorías tienen productos con UNA sola llamada
  useEffect(() => {
    const checkAllCategoriesWithProducts = async () => {
      if (beverageCategories.length === 0) return;

      try {
        // Una sola llamada masiva para obtener todos los productos
        const data = await getProducts(1, 200, null, null);
        const allProducts = Array.isArray(data.cocteles) ? data.cocteles : [];

        // Filtrar solo "otras bebidas" (excluir comida y cócteles)
        const otherDrinks = allProducts.filter((p) => {
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

        // Extraer todas las categorías presentes en estos productos
        const mainCatsSet = new Set();
        const wineCatsSet = new Set();
        const destiladoCatsSet = new Set();

        const bevCatNames = new Set(beverageCategories.map((c) => normalize(c.name)));
        const wineCatNames = new Set(wineSubcategories.map((c) => normalize(c.name)));
        const destCatNames = new Set(destiladoSubcategories.map((c) => normalize(c.name)));

        otherDrinks.forEach((product) => {
          if (Array.isArray(product.categories)) {
            product.categories.forEach((cat) => {
              const catName = normalize(cat.name);
              if (bevCatNames.has(catName)) mainCatsSet.add(catName);
              if (wineCatNames.has(catName)) wineCatsSet.add(catName);
              if (destCatNames.has(catName)) destiladoCatsSet.add(catName);
            });
          }
          // Campos directos
          if (product.destilado_name) {
            const dn = normalize(product.destilado_name);
            if (destCatNames.has(dn)) destiladoCatsSet.add(dn);
          }
        });

        setCategoriesWithProducts(mainCatsSet);
        setWineSubcatsWithProducts(wineCatsSet);
        setDestiladoSubcatsWithProducts(destiladoCatsSet);
      } catch (_err) {
        // En caso de error, mostrar todas (mejor UX)
        setCategoriesWithProducts(new Set(beverageCategories.map((c) => normalize(c.name))));
        setWineSubcatsWithProducts(new Set(wineSubcategories.map((c) => normalize(c.name))));
        setDestiladoSubcatsWithProducts(new Set(destiladoSubcategories.map((c) => normalize(c.name))));
      }
    };

    checkAllCategoriesWithProducts();
  }, [beverageCategories, wineSubcategories, destiladoSubcategories]);

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

      {/* Título */}
      <div className="text-center mb-6 px-4">
        <h1
          className="text-2xl md:text-3xl lg:text-4xl uppercase mb-3"
          style={{
            color: '#e9cc9e',
            fontFamily: '\'Playfair Display\', serif',
            fontWeight: '500',
            letterSpacing: '0.12em',
          }}
        >
          {t('pageTitle.otherDrinks')}
        </h1>
        <p
          className="text-xs md:text-sm uppercase tracking-[0.15em] font-medium"
          style={{ color: '#5a5a4a' }}
        >
          {totalRecords > 0
            ? t('pageTitle.foundBeverages', { count: totalRecords })
            : t('pageTitle.noResults')}
        </p>
      </div>

      {/* Filtros principales - estilo menú de bar */}
      <div className="w-full max-w-7xl mx-auto px-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px" style={{ backgroundColor: '#3a3a3a' }} />
          <span
            className="text-[10px] md:text-xs uppercase tracking-[0.25em] font-medium"
            style={{ color: '#8a7a5a' }}
          >
            {t('pageTitle.otherDrinks')}
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: '#3a3a3a' }} />
        </div>

        <nav
          className="flex flex-nowrap items-center gap-1 md:gap-0 overflow-x-auto scroll-smooth no-scrollbar justify-start md:justify-center"
          role="tablist"
        >
          {/* Filtro "Todos" */}
          <button
            className="group relative flex-shrink-0 px-4 md:px-5 py-2.5 text-sm md:text-base tracking-wide transition-all duration-300 uppercase"
            style={{
              color: filter === 'todos' ? '#e9cc9e' : '#7a7a6a',
              fontWeight: filter === 'todos' ? '600' : '400',
              letterSpacing: '0.08em',
              background: 'transparent',
              border: 'none',
            }}
            onClick={() => {
              setFilter('todos');
              setSubFilter(null);
              setCurrentPage(1);
            }}
            role="tab"
            aria-selected={filter === 'todos'}
          >
            {t('categoryFilter.all')}
            <span
              className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] transition-all duration-300"
              style={{
                width: filter === 'todos' ? '60%' : '0%',
                backgroundColor: '#e9cc9e',
              }}
            />
            {filter !== 'todos' && (
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] transition-all duration-300 opacity-0 group-hover:opacity-100"
                style={{ width: '40%', backgroundColor: '#5a5a4a' }}
              />
            )}
          </button>

          {/* Filtros dinámicos */}
          {beverageCategories
            .filter((cat) => {
              if (categoriesWithProducts.size === 0 && beverageCategories.length > 0) {
                return false;
              }
              return categoriesWithProducts.has(normalize(cat.name));
            })
            .map((cat, index, arr) => {
              const isActive = filter === normalize(cat.name);
              return (
                <React.Fragment key={cat.id}>
                  <span
                    className="flex-shrink-0 text-lg font-extralight select-none hidden md:inline"
                    style={{ color: '#3a3a3a' }}
                  >
                    ·
                  </span>
                  <button
                    className="group relative flex-shrink-0 px-4 md:px-5 py-2.5 text-sm md:text-base capitalize tracking-wide transition-all duration-300"
                    style={{
                      color: isActive ? '#e9cc9e' : '#7a7a6a',
                      fontWeight: isActive ? '600' : '400',
                      letterSpacing: '0.08em',
                      background: 'transparent',
                      border: 'none',
                    }}
                    onClick={() => {
                      setFilter(normalize(cat.name));
                      setSubFilter(null);
                      setCurrentPage(1);
                    }}
                    role="tab"
                    aria-selected={isActive}
                  >
                    {cat.name}
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] transition-all duration-300"
                      style={{
                        width: isActive ? '60%' : '0%',
                        backgroundColor: '#e9cc9e',
                      }}
                    />
                    {!isActive && (
                      <span
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] transition-all duration-300 opacity-0 group-hover:opacity-100"
                        style={{ width: '40%', backgroundColor: '#5a5a4a' }}
                      />
                    )}
                  </button>
                </React.Fragment>
              );
            })}
        </nav>

        <div className="mt-3 h-px w-full" style={{ backgroundColor: '#3a3a3a' }} />
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
            className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium mb-2 text-center"
            style={{ color: '#5a5a4a' }}
          >
            Tipos de vino
          </p>
          <nav className="flex flex-nowrap items-center gap-1 md:gap-0 overflow-x-auto scroll-smooth no-scrollbar justify-start md:justify-center">
            <button
              className="group relative flex-shrink-0 px-3 md:px-4 py-2 text-xs md:text-sm tracking-wide transition-all duration-300 uppercase"
              style={{
                color: !subFilter ? '#e9cc9e' : '#7a7a6a',
                fontWeight: !subFilter ? '600' : '400',
                letterSpacing: '0.08em',
                background: 'transparent',
                border: 'none',
              }}
              onClick={() => { setSubFilter(null); setCurrentPage(1); }}
            >
              {t('categoryFilter.allWines')}
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] transition-all duration-300"
                style={{ width: !subFilter ? '60%' : '0%', backgroundColor: '#e9cc9e' }}
              />
            </button>
            {wineSubcategories
              .filter((cat) => {
                if (wineSubcatsWithProducts.size === 0 && wineSubcategories.length > 0) return false;
                return wineSubcatsWithProducts.has(normalize(cat.name));
              })
              .map((cat) => {
                const isActive = subFilter === normalize(cat.name);
                return (
                  <React.Fragment key={cat.id}>
                    <span className="flex-shrink-0 text-lg font-extralight select-none hidden md:inline" style={{ color: '#3a3a3a' }}>·</span>
                    <button
                      className="group relative flex-shrink-0 px-3 md:px-4 py-2 text-xs md:text-sm capitalize tracking-wide transition-all duration-300"
                      style={{
                        color: isActive ? '#e9cc9e' : '#7a7a6a',
                        fontWeight: isActive ? '600' : '400',
                        letterSpacing: '0.08em',
                        background: 'transparent',
                        border: 'none',
                      }}
                      onClick={() => { setSubFilter(normalize(cat.name)); setCurrentPage(1); }}
                    >
                      {cat.name}
                      <span
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] transition-all duration-300"
                        style={{ width: isActive ? '60%' : '0%', backgroundColor: '#e9cc9e' }}
                      />
                      {!isActive && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] transition-all duration-300 opacity-0 group-hover:opacity-100" style={{ width: '40%', backgroundColor: '#5a5a4a' }} />
                      )}
                    </button>
                  </React.Fragment>
                );
              })}
          </nav>
        </div>
      )}

      {/* Subfiltros de botellas */}
      {filter === 'botellas' && 
        destiladoSubcategories.filter((cat) => {
          if (destiladoSubcatsWithProducts.size === 0 && destiladoSubcategories.length > 0) return false;
          return destiladoSubcatsWithProducts.has(normalize(cat.name));
        }).length > 0 && (
        <div className="w-full max-w-7xl mx-auto px-4 mb-4">
          <p
            className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium mb-2 text-center"
            style={{ color: '#5a5a4a' }}
          >
            Tipo de destilado
          </p>
          <nav className="flex flex-nowrap items-center gap-1 md:gap-0 overflow-x-auto scroll-smooth no-scrollbar justify-start md:justify-center">
            <button
              className="group relative flex-shrink-0 px-3 md:px-4 py-2 text-xs md:text-sm tracking-wide transition-all duration-300 uppercase"
              style={{
                color: !subFilter ? '#e9cc9e' : '#7a7a6a',
                fontWeight: !subFilter ? '600' : '400',
                letterSpacing: '0.08em',
                background: 'transparent',
                border: 'none',
              }}
              onClick={() => { setSubFilter(null); setCurrentPage(1); }}
            >
              Todas las botellas
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] transition-all duration-300"
                style={{ width: !subFilter ? '60%' : '0%', backgroundColor: '#e9cc9e' }}
              />
            </button>
            {destiladoSubcategories
              .filter((cat) => {
                if (destiladoSubcatsWithProducts.size === 0 && destiladoSubcategories.length > 0) return false;
                return destiladoSubcatsWithProducts.has(normalize(cat.name));
              })
              .map((cat) => {
                const isActive = subFilter === normalize(cat.name);
                return (
                  <React.Fragment key={cat.id}>
                    <span className="flex-shrink-0 text-lg font-extralight select-none hidden md:inline" style={{ color: '#3a3a3a' }}>·</span>
                    <button
                      className="group relative flex-shrink-0 px-3 md:px-4 py-2 text-xs md:text-sm capitalize tracking-wide transition-all duration-300"
                      style={{
                        color: isActive ? '#e9cc9e' : '#7a7a6a',
                        fontWeight: isActive ? '600' : '400',
                        letterSpacing: '0.08em',
                        background: 'transparent',
                        border: 'none',
                      }}
                      onClick={() => { setSubFilter(normalize(cat.name)); setCurrentPage(1); }}
                    >
                      {cat.name}
                      <span
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] transition-all duration-300"
                        style={{ width: isActive ? '60%' : '0%', backgroundColor: '#e9cc9e' }}
                      />
                      {!isActive && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] transition-all duration-300 opacity-0 group-hover:opacity-100" style={{ width: '40%', backgroundColor: '#5a5a4a' }} />
                      )}
                    </button>
                  </React.Fragment>
                );
              })}
          </nav>
        </div>
      )}

      {/* Subfiltros de tragos */}
      {filter === 'tragos' && 
        destiladoSubcategories.filter((cat) => {
          if (destiladoSubcatsWithProducts.size === 0 && destiladoSubcategories.length > 0) return false;
          return destiladoSubcatsWithProducts.has(normalize(cat.name));
        }).length > 0 && (
        <div className="w-full max-w-7xl mx-auto px-4 mb-4">
          <p
            className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium mb-2 text-center"
            style={{ color: '#5a5a4a' }}
          >
            Tipo de destilado
          </p>
          <nav className="flex flex-nowrap items-center gap-1 md:gap-0 overflow-x-auto scroll-smooth no-scrollbar justify-start md:justify-center">
            <button
              className="group relative flex-shrink-0 px-3 md:px-4 py-2 text-xs md:text-sm tracking-wide transition-all duration-300 uppercase"
              style={{
                color: !subFilter ? '#e9cc9e' : '#7a7a6a',
                fontWeight: !subFilter ? '600' : '400',
                letterSpacing: '0.08em',
                background: 'transparent',
                border: 'none',
              }}
              onClick={() => { setSubFilter(null); setCurrentPage(1); }}
            >
              {t('categoryFilter.allDrinks')}
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] transition-all duration-300"
                style={{ width: !subFilter ? '60%' : '0%', backgroundColor: '#e9cc9e' }}
              />
            </button>
            {destiladoSubcategories
              .filter((cat) => {
                if (destiladoSubcatsWithProducts.size === 0 && destiladoSubcategories.length > 0) return false;
                return destiladoSubcatsWithProducts.has(normalize(cat.name));
              })
              .map((cat) => {
                const isActive = subFilter === normalize(cat.name);
                return (
                  <React.Fragment key={cat.id}>
                    <span className="flex-shrink-0 text-lg font-extralight select-none hidden md:inline" style={{ color: '#3a3a3a' }}>·</span>
                    <button
                      className="group relative flex-shrink-0 px-3 md:px-4 py-2 text-xs md:text-sm capitalize tracking-wide transition-all duration-300"
                      style={{
                        color: isActive ? '#e9cc9e' : '#7a7a6a',
                        fontWeight: isActive ? '600' : '400',
                        letterSpacing: '0.08em',
                        background: 'transparent',
                        border: 'none',
                      }}
                      onClick={() => { setSubFilter(normalize(cat.name)); setCurrentPage(1); }}
                    >
                      {cat.name}
                      <span
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] transition-all duration-300"
                        style={{ width: isActive ? '60%' : '0%', backgroundColor: '#e9cc9e' }}
                      />
                      {!isActive && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] transition-all duration-300 opacity-0 group-hover:opacity-100" style={{ width: '40%', backgroundColor: '#5a5a4a' }} />
                      )}
                    </button>
                  </React.Fragment>
                );
              })}
          </nav>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 px-4 sm:px-8 max-w-[1100px] mx-auto">
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-20 w-full">
              <p className="text-xl" style={{ color: '#b8b8b8' }}>
                {t('pageTitle.noResults')}
              </p>
            </div>
          ) : (
            filteredItems.map((p) => {
              const bevCategories = p.categories
                ? p.categories.filter((cat) => cat.type === 'clasificacion bebida')
                : [];

              return (
                <div
                  key={p.id}
                  className="w-full cursor-pointer transition-all duration-200 hover:bg-[#2f2f2f] flex flex-row gap-4 p-4 rounded-xl group"
                  style={{
                    backgroundColor: 'transparent',
                    borderBottom: '1px solid #2a2a2a',
                  }}
                >
                  {/* Imagen centrada */}
                  {p.images?.[0] && (
                    <div className="flex-shrink-0 self-center">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-2 transition-transform duration-300 group-hover:scale-105"
                        style={{ borderColor: '#3a3a3a' }}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}

                  {/* Contenido textual */}
                  <div className="flex-grow min-w-0">
                    {/* Nombre ··· Precio */}
                    <div className="flex items-baseline gap-2 mb-1">
                      <h3
                        className="text-base md:text-lg capitalize leading-tight truncate"
                        style={{
                          color: '#e9cc9e',
                          fontWeight: '500',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {p.name}
                      </h3>
                      <div
                        className="flex-grow border-b border-dotted mx-1"
                        style={{ borderColor: '#4a4a4a', minWidth: '20px', marginBottom: '4px' }}
                      />
                      <span
                        className="text-sm md:text-base whitespace-nowrap flex-shrink-0"
                        style={{
                          color: '#e9cc9e',
                          fontWeight: '500',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {currency(p.price)}
                      </span>
                    </div>

                    {/* Categoría + Alcohol */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {bevCategories.length > 0 && (
                        <span
                          className="text-xs font-medium capitalize tracking-wide"
                          style={{ color: '#8a8a7a' }}
                        >
                          {bevCategories[0].name}
                        </span>
                      )}
                      {p.alcohol_percentage && (
                        <>
                          <span style={{ color: '#4a4a4a' }}>·</span>
                          <span
                            className="text-xs font-medium"
                            style={{ color: '#8a8a7a' }}
                          >
                            {p.alcohol_percentage}% Vol.
                          </span>
                        </>
                      )}
                    </div>

                    {/* Descripción */}
                    {p.description && (
                      <p
                        className="text-sm leading-relaxed line-clamp-2 mb-1.5"
                        style={{ color: '#9a9a9a' }}
                        title={p.description}
                      >
                        {p.description}
                      </p>
                    )}

                    {/* Categorías adicionales */}
                    {bevCategories.length > 1 && (
                      <p
                        className="text-xs italic line-clamp-1"
                        style={{ color: '#6a6a6a' }}
                      >
                        {bevCategories.slice(1).map((c) => c.name).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Paginación */}
      {!loading && totalPages > 0 && (
        <div className="flex flex-col items-center mt-8 mb-6 px-4 max-w-xl mx-auto">
          <div className="flex items-center gap-3 w-full mb-4">
            <div className="flex-1 h-px" style={{ backgroundColor: '#3a3a3a' }} />
            <span
              className="text-[10px] md:text-xs uppercase tracking-[0.25em] font-medium whitespace-nowrap"
              style={{ color: '#8a7a5a' }}
            >
              {filteredItems.length} de {totalRecords} bebidas
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#3a3a3a' }} />
          </div>

          <nav className="flex items-center gap-1 md:gap-0">
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

            <span className="text-lg font-extralight select-none hidden md:inline" style={{ color: '#3a3a3a' }}>·</span>

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
                    <span className="text-lg font-extralight select-none hidden md:inline" style={{ color: '#3a3a3a' }}>·</span>
                  )}
                </React.Fragment>
              );
            })}

            <span className="text-lg font-extralight select-none hidden md:inline" style={{ color: '#3a3a3a' }}>·</span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
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

          <span
            className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium mt-2"
            style={{ color: '#5a5a4a' }}
          >
            Página {currentPage} de {totalPages}
          </span>
        </div>
      )}
    </div>
  );
};

export default OtherDrinks;
