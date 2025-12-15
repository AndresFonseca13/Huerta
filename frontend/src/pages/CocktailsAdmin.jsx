import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductsAdmin } from '../services/productService.js';
import { getAllCategories } from '../services/categoryService.js';
// Quitamos BackButton: navegación persiste en el layout
import EditCocktailModal from '../components/EditCocktailModal';
import ManageCocktailModal from '../components/ManageCocktailModal';
import CocktailDetailModal from '../components/CocktailDetailModal';
import PreviewCardCocktail from '../components/PreviewCardCocktail';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  FiEdit,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiMoreVertical,
  FiSearch,
  FiX,
  FiChevronUp,
  FiChevronDown,
  FiPlus,
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const CocktailsAdmin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cocktails, setCocktails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCocktail, setSelectedCocktail] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  // const [expandedRowId, setExpandedRowId] = useState(null);
  const [sortBy] = useState(null);
  const [sortOrder] = useState('asc');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null); // 'active' | 'inactive' | null
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const listTopRef = useRef(null);
  const [beverageCats, setBeverageCats] = useState([]);

  useEffect(() => {
    const fetchCocktails = async () => {
      try {
        const [resDest, resClasifBeb] = await Promise.all([
          getProductsAdmin(1, 200, null, 'destilado'),
          getProductsAdmin(1, 200, null, 'clasificacion bebida'),
        ]);
        const listA = resDest.cocteles || [];
        const listB = resClasifBeb.cocteles || [];
        const merged = new Map();
        [...listA, ...listB].forEach((p) => merged.set(p.id, p));
        setCocktails(Array.from(merged.values()));
        // Cargar categorías de bebidas
        try {
          const all = await getAllCategories(false);
          const onlyBeb = (Array.isArray(all) ? all : []).filter(
            (c) => (c?.type || '').toLowerCase() === 'clasificacion bebida',
          );
          setBeverageCats(onlyBeb);
        } catch (_) {
          setBeverageCats([]);
        }
      } catch {
        setError('No se pudieron cargar los cócteles.');
      } finally {
        setLoading(false);
      }
    };
    fetchCocktails();
  }, []);

  const refreshCocktails = async () => {
    setLoading(true);
    try {
      const [resDest, resClasifBeb] = await Promise.all([
        getProductsAdmin(1, 200, null, 'destilado'),
        getProductsAdmin(1, 200, null, 'clasificacion bebida'),
      ]);
      const listA = resDest.cocteles || [];
      const listB = resClasifBeb.cocteles || [];
      const merged = new Map();
      [...listA, ...listB].forEach((p) => merged.set(p.id, p));
      setCocktails(Array.from(merged.values()));
    } catch {
      setError('No se pudieron cargar los cócteles.');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (cocktail) => {
    setSelectedCocktail(cocktail);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCocktail(null);
  };
  const openManageModal = (cocktail) => {
    setSelectedCocktail(cocktail);
    setIsManageModalOpen(true);
  };
  const closeManageModal = () => {
    setIsManageModalOpen(false);
    setSelectedCocktail(null);
  };
  const openDetailModal = (cocktail) => {
    setSelectedCocktail(cocktail);
    setIsDetailModalOpen(true);
  };
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCocktail(null);
  };
  const handleUpdateSuccess = () => {
    closeEditModal();
    closeManageModal();
    refreshCocktails();
  };
  // const toggleRow = (id) => {
  //     setExpandedRowId((prevId) => (prevId === id ? null : id));
  // };

  // Siempre calcular hooks antes de cualquier return condicional
  // Obtener categorías únicas (solo destilado)
  const uniqueCategories = useMemo(() => {
    const names = new Set();
    // 1) Añadir explícitamente categorías de 'clasificacion bebida' desde backend
    for (const cat of beverageCats) {
      if (cat?.name) names.add(cat.name);
    }
    // 2) Unir con categorías presentes en productos, filtrando tags no deseados
    for (const c of cocktails) {
      for (const cat of c.categories || []) {
        const name = typeof cat === 'string' ? cat : cat.name;
        const type =
					typeof cat === 'string' ? null : (cat.type || '').toLowerCase();
        const n = (name || '').toLowerCase();
        const isGroup = n.startsWith('grupo:');
        const isPresentation = n === 'botella' || n === 'trago';
        if (isGroup || isPresentation) continue;
        if (type === 'clasificacion bebida' || type === 'destilado') {
          names.add(name);
        }
      }
    }
    return Array.from(names);
  }, [cocktails, beverageCats]);

  // const formatCategories = (categories) => {
  //     if (!categories || categories.length === 0) {
  //         return <span className="text-gray-400">Sin categorías</span>;
  //     }
  //     return categories.map((cat, index) => {
  //         const categoryName = typeof cat === "string" ? cat : cat.name;
  //         return (
  //             <span
  //                 key={index}
  //                 className="inline-block bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full"
  //             >
  //                 {categoryName}
  //             </span>
  //         );
  //     });
  // };

  // Función para filtrar por letras en cualquier orden
  function matchesAllLetters(name, search) {
    if (!search) return true;
    const nameLower = name.toLowerCase();
    return search
      .toLowerCase()
      .split('')
      .every((char) => nameLower.includes(char));
  }

  // Lógica de filtrado y ordenamiento
  let filtered = [...cocktails];
  if (categoryFilter)
    filtered = filtered.filter((cocktail) =>
      (cocktail.categories || []).some(
        (cat) => (typeof cat === 'string' ? cat : cat.name) === categoryFilter,
      ),
    );
  if (statusFilter === 'active') {
    filtered = filtered.filter((c) => c.is_active);
  } else if (statusFilter === 'inactive') {
    filtered = filtered.filter((c) => !c.is_active);
  }
  if (searchTerm)
    filtered = filtered.filter((cocktail) =>
      matchesAllLetters(cocktail.name, searchTerm),
    );
  if (sortBy === 'name') {
    filtered.sort((a, b) => {
      if (a.name.toLowerCase() < b.name.toLowerCase())
        return sortOrder === 'asc' ? -1 : 1;
      if (a.name.toLowerCase() > b.name.toLowerCase())
        return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }
  if (sortBy === 'price') {
    filtered.sort((a, b) => {
      if (a.price < b.price) return sortOrder === 'asc' ? -1 : 1;
      if (a.price > b.price) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Paginación cliente
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIdx = (safeCurrentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginated = filtered.slice(startIdx, endIdx);

  // Scroll al top al cambiar página
  useEffect(() => {
    if (listTopRef.current) {
      try {
        listTopRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      } catch (_) {
        listTopRef.current.scrollIntoView();
      }
    }
  }, [safeCurrentPage]);

  if (loading) {
    return (
      <div
        className="p-6 md:p-10 min-h-screen"
        style={{ backgroundColor: '#191919' }}
      >
        <div className="max-w-6xl mx-auto">
          <div
            className="h-8 w-48 rounded animate-pulse mb-4"
            style={{ backgroundColor: '#2a2a2a' }}
          />
          <div
            className="h-5 w-72 rounded animate-pulse mb-6"
            style={{ backgroundColor: '#2a2a2a' }}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-xl shadow-sm p-4"
                style={{
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #3a3a3a',
                }}
              >
                <div
                  className="h-4 w-24 rounded animate-pulse mb-2"
                  style={{ backgroundColor: '#3a3a3a' }}
                />
                <div
                  className="h-6 w-16 rounded animate-pulse"
                  style={{ backgroundColor: '#3a3a3a' }}
                />
              </div>
            ))}
          </div>
          <div
            className="h-10 rounded-t-xl shadow-sm"
            style={{ backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a' }}
          />
          <div
            className="h-64 rounded-b-xl shadow-sm mt-2"
            style={{ backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a' }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  // Handlers de encabezados
  // const handleSortByName = () => {
  //     if (sortBy !== "name") {
  //         setSortBy("name");
  //         setSortOrder("asc");
  //     } else {
  //         setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  //     }
  // };
  // const handleSortByPrice = () => {
  //     if (sortBy !== "price") {
  //         setSortBy("price");
  //         setSortOrder("asc");
  //     } else {
  //         setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  //     }
  // };

  // KPIs simples
  const total = cocktails.length;
  const activos = cocktails.filter((c) => c.is_active).length;
  const inactivos = total - activos;

  return (
    <div
      className="p-4 md:p-8 min-h-screen"
      style={{ backgroundColor: '#191919' }}
    >
      <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center w-full">
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <Motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <h1
                className="text-3xl md:text-4xl font-extrabold mb-1 tracking-tight"
                style={{ color: '#e9cc9e' }}
              >
								Gestión de Bebidas
              </h1>
              <p style={{ color: '#b8b8b8' }}>
								Administra las bebidas del sistema
              </p>
            </Motion.div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => navigate('/admin/create')}
                className="flex items-center px-4 py-2 rounded-lg transition-transform font-medium shadow-sm hover:shadow md:active:scale-95"
                style={{ backgroundColor: '#e9cc9e', color: '#191919' }}
              >
                <FiPlus className="mr-2" />
								Crear Bebida
              </button>
            </div>
          </div>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <Motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.0 }}
              className={`rounded-xl shadow-sm p-4 cursor-pointer ${
                statusFilter === null ? 'ring-2' : ''
              }`}
              style={{
                backgroundColor: '#2a2a2a',
                border: '1px solid #3a3a3a',
                boxShadow: 'none',
                outlineColor: '#e9cc9e',
              }}
              onClick={() => setStatusFilter(null)}
            >
              <div className="text-sm" style={{ color: '#b8b8b8' }}>
								Total
              </div>
              <div
                className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full text-sm"
                style={{ backgroundColor: '#3a3a3a', color: '#e9cc9e' }}
              >
                <span className="font-semibold text-base">{total}</span>
              </div>
            </Motion.div>
            <Motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className={`rounded-xl shadow-sm p-4 cursor-pointer ${
                statusFilter === 'active' ? 'ring-2' : ''
              }`}
              style={{
                backgroundColor: '#2a2a2a',
                border: '1px solid #3a3a3a',
              }}
              onClick={() => setStatusFilter('active')}
            >
              <div className="text-sm" style={{ color: '#b8b8b8' }}>
								Activos
              </div>
              <div
                className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full text-sm"
                style={{ backgroundColor: '#3a3a3a', color: '#e9cc9e' }}
              >
                <span className="font-semibold text-base">{activos}</span>
              </div>
            </Motion.div>
            <Motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`rounded-xl shadow-sm p-4 cursor-pointer ${
                statusFilter === 'inactive' ? 'ring-2' : ''
              }`}
              style={{
                backgroundColor: '#2a2a2a',
                border: '1px solid #3a3a3a',
              }}
              onClick={() => setStatusFilter('inactive')}
            >
              <div className="text-sm" style={{ color: '#b8b8b8' }}>
								Inactivos
              </div>
              <div
                className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full text-sm"
                style={{ backgroundColor: '#3a3a3a', color: '#e9cc9e' }}
              >
                <span className="font-semibold text-base">{inactivos}</span>
              </div>
            </Motion.div>
          </div>
          {/* Eliminamos dropdown móvil; ahora usamos píldoras con scroll arriba */}
        </div>
      </header>
      <main>
        {/* Buscador y filtros */}
        <div className="flex flex-col gap-4 mb-4">
          <div className="relative w-full max-w-xl">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: '#b8b8b8' }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar bebida..."
              className="pl-10 pr-4 py-2 w-full rounded-lg focus:outline-none placeholder-[#b8b8b8] caret-[#e9cc9e]"
              style={{
                backgroundColor: '#2a2a2a',
                color: '#e9cc9e',
                border: '1px solid #3a3a3a',
              }}
            />
          </div>
          {/* Píldoras de categorías (desktop y mobile) */}
          <div className="w-full">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setCategoryFilter(null)}
                className={`px-3 py-1.5 rounded-full border text-sm whitespace-nowrap ${
                  categoryFilter === null
                    ? 'border-[#e9cc9e] text-[#191919]'
                    : 'bg-[#2a2a2a] text-[#e9cc9e] border-[#3a3a3a] hover:bg-[#3a3a3a]'
                }`}
                style={
                  categoryFilter === null ? { backgroundColor: '#e9cc9e' } : {}
                }
              >
                {t('categoryFilter.all')}
              </button>
              {uniqueCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-full border text-sm capitalize whitespace-nowrap ${
                    categoryFilter === cat
                      ? 'border-[#e9cc9e] text-[#191919]'
                      : 'bg-[#2a2a2a] text-[#e9cc9e] border-[#3a3a3a] hover:bg-[#3a3a3a]'
                  }`}
                  style={
                    categoryFilter === cat ? { backgroundColor: '#e9cc9e' } : {}
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ancla para scroll al top de la lista */}
        <div ref={listTopRef} />

        {/* Grid de mini-cards estilo admin con paginación */}
        {filtered.length === 0 ? (
          <div
            className="p-10 text-center bg-white rounded-xl"
            style={{
              backgroundColor: '#2a2a2a',
              color: '#b8b8b8',
              border: '1px solid #3a3a3a',
            }}
          >
						No hay bebidas para mostrar.
          </div>
        ) : (
          <Motion.div
            key={safeCurrentPage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
          >
            {paginated.map((cocktail) => (
              <div
                key={cocktail.id}
                className="rounded-xl shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow"
                style={{
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #3a3a3a',
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3
                      className="text-lg font-semibold capitalize"
                      style={{ color: '#e9cc9e' }}
                    >
                      {cocktail.name}
                    </h3>
                    <p
                      className="text-sm line-clamp-2 mt-1"
                      style={{ color: '#b8b8b8' }}
                    >
                      {cocktail.description}
                    </p>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ backgroundColor: '#3a3a3a', color: '#e9cc9e' }}
                  >
                    {cocktail.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  {cocktail.destilado_name && (
                    <span
                      className="text-xs px-2 py-1 rounded-full capitalize"
                      style={{ backgroundColor: '#3a3a3a', color: '#e9cc9e' }}
                    >
                      {cocktail.destilado_name}
                    </span>
                  )}
                  {Array.isArray(cocktail.categories) &&
										(() => {
										  const dest = (
										    cocktail.destilado_name || ''
										  ).toLowerCase();
										  const names = (cocktail.categories || [])
										    .map((c) => (typeof c === 'string' ? c : c.name))
										    .filter(Boolean);
										  const dedup = Array.from(new Set(names))
										    .filter((n) => n.toLowerCase() !== dest)
										    .slice(0, 2);
										  return dedup.map((name, idx) => (
										    <span
										      key={idx}
										      className="text-xs px-2 py-1 rounded-full capitalize"
										      style={{
										        backgroundColor: '#3a3a3a',
										        color: '#e9cc9e',
										      }}
										    >
										      {name}
										    </span>
										  ));
										})()}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div
                    className="text-sm font-semibold"
                    style={{ color: '#e9cc9e' }}
                  >
										${Number(cocktail.price).toLocaleString('es-CO')}
                  </div>
                  {cocktail.alcohol_percentage != null && (
                    <div
                      className="text-xs font-medium"
                      style={{ color: '#b8b8b8' }}
                    >
                      {cocktail.alcohol_percentage}%
                    </div>
                  )}
                </div>

                {Array.isArray(cocktail.ingredients) &&
									cocktail.ingredients.length > 0 && (
                  <div className="mt-3">
                    <div
                      className="text-xs mb-1"
                      style={{ color: '#b8b8b8' }}
                    >
												Ingredientes:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cocktail.ingredients.slice(0, 3).map((ing, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 rounded-full capitalize"
                          style={{
                            backgroundColor: '#3a3a3a',
                            color: '#e9cc9e',
                          }}
                        >
                          {typeof ing === 'string' ? ing : ing.name}
                        </span>
                      ))}
                      {cocktail.ingredients.length > 3 && (
                        <span
                          className="text-[11px]"
                          style={{ color: '#b8b8b8' }}
                        >
														+{cocktail.ingredients.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => openDetailModal(cocktail)}
                    className="inline-flex items-center text-sm font-medium px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor: '#2a2a2a',
                      color: '#e9cc9e',
                      border: '1px solid #3a3a3a',
                    }}
                  >
                    <FiSearch className="mr-1" /> Ver
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(cocktail)}
                      className="inline-flex items-center text-sm font-medium px-3 py-1.5 rounded-full"
                      style={{
                        backgroundColor: '#2a2a2a',
                        color: '#e9cc9e',
                        border: '1px solid #3a3a3a',
                      }}
                    >
                      <FiEdit className="mr-1" /> Editar
                    </button>
                    <button
                      onClick={() => openManageModal(cocktail)}
                      className="inline-flex items-center text-sm font-medium px-3 py-1.5 rounded-full"
                      style={{
                        backgroundColor: '#2a2a2a',
                        color: '#e9cc9e',
                        border: '1px solid #3a3a3a',
                      }}
                    >
                      {cocktail.is_active ? (
                        <FiEyeOff className="mr-1" />
                      ) : (
                        <FiEye className="mr-1" />
                      )}{' '}
                      {cocktail.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Motion.div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg"
              style={{
                backgroundColor: '#2a2a2a',
                color: '#e9cc9e',
                border: '1px solid #3a3a3a',
              }}
              disabled={safeCurrentPage === 1}
            >
							Anterior
            </button>
            <div className="text-sm" style={{ color: '#b8b8b8' }}>
							Página <span className="font-semibold">{safeCurrentPage}</span> de{' '}
              {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg"
              style={{
                backgroundColor: '#2a2a2a',
                color: '#e9cc9e',
                border: '1px solid #3a3a3a',
              }}
              disabled={safeCurrentPage === totalPages}
            >
							Siguiente
            </button>
          </div>
        )}
      </main>
      {/* Modales */}
      <EditCocktailModal
        cocktail={selectedCocktail}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onUpdateSuccess={handleUpdateSuccess}
      />
      <ManageCocktailModal
        cocktail={selectedCocktail}
        isOpen={isManageModalOpen}
        onClose={closeManageModal}
        onUpdateSuccess={handleUpdateSuccess}
      />
      <CocktailDetailModal
        cocktail={selectedCocktail}
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
      />
      {/* Modal de vista previa usando PreviewCardCocktail */}
      {isDetailModalOpen && selectedCocktail && (
        <PreviewCardCocktail
          cocktail={selectedCocktail}
          isModal={true}
          onClose={closeDetailModal}
        />
      )}
    </div>
  );
};

export default CocktailsAdmin;
