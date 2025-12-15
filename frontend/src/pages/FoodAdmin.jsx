import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
  FiEdit,
  FiSearch,
  FiTrash2,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiPlus,
} from 'react-icons/fi';
import { getProductsAdmin } from '../services/productService';
import EditFoodModal from '../components/EditFoodModal';
import ManageFoodModal from '../components/ManageFoodModal';
import CocktailDetailModal from '../components/CocktailDetailModal';
import { useTranslation } from 'react-i18next';

const FoodAdmin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null); // 'active' | 'inactive' | null
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const listTopRef = useRef(null);

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const response = await getProductsAdmin(
          1,
          100,
          null,
          'clasificacion comida',
        );
        setItems(response.cocteles || []); // backend mantiene clave 'cocteles'
      } catch {
        setError('No se pudieron cargar los productos de comida.');
      } finally {
        setLoading(false);
      }
    };
    fetchFood();
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const response = await getProductsAdmin(
        1,
        100,
        null,
        'clasificacion comida',
      );
      setItems(response.cocteles || []);
    } catch {
      setError('No se pudieron cargar los productos de comida.');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (it) => {
    setSelected(it);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelected(null);
  };
  const openManageModal = (it) => {
    setSelected(it);
    setIsManageModalOpen(true);
  };
  const closeManageModal = () => {
    setIsManageModalOpen(false);
    setSelected(null);
  };
  const openDetailModal = (it) => {
    setSelected(it);
    setIsDetailModalOpen(true);
  };
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelected(null);
  };
  const handleUpdateSuccess = () => {
    closeEditModal();
    closeManageModal();
    refresh();
  };

  // Clasificaciones únicas (Entrada, Postre, Fuerte, ...)
  const uniqueClassifications = useMemo(() => {
    return Array.from(
      new Set(
        items
          .map((c) => c.food_classification_name)
          .filter((v) => typeof v === 'string' && v.trim().length > 0),
      ),
    );
  }, [items]);

  // KPIs
  const total = items.length;
  const activos = items.filter((c) => c.is_active).length;
  const inactivos = total - activos;

  // Filtrado
  const matchesAllLetters = (name, search) => {
    if (!search) return true;
    const nameLower = (name || '').toLowerCase();
    return search
      .toLowerCase()
      .split('')
      .every((ch) => nameLower.includes(ch));
  };

  let filtered = [...items];
  if (categoryFilter)
    filtered = filtered.filter((it) => {
      const byClassification =
				(it.food_classification_name || '').toLowerCase() ===
				String(categoryFilter).toLowerCase();
      const byCategory = (it.categories || []).some(
        (cat) => (typeof cat === 'string' ? cat : cat.name) === categoryFilter,
      );
      return byClassification || byCategory;
    });
  if (statusFilter === 'active') filtered = filtered.filter((c) => c.is_active);
  else if (statusFilter === 'inactive')
    filtered = filtered.filter((c) => !c.is_active);
  if (searchTerm)
    filtered = filtered.filter((it) => matchesAllLetters(it.name, searchTerm));

  // Paginación
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIdx = (safeCurrentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginated = filtered.slice(startIdx, endIdx);

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

  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

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
								Gestión de Comida
              </h1>
              <p style={{ color: '#b8b8b8' }}>
								Administra los productos de comida
              </p>
            </Motion.div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => navigate('/admin/food/create')}
                className="flex items-center px-4 py-2 rounded-lg transition-transform font-medium shadow-sm hover:shadow md:active:scale-95"
                style={{ backgroundColor: '#e9cc9e', color: '#191919' }}
              >
                <FiPlus className="mr-2" /> Crear Plato
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
        </div>
      </header>

      <main>
        {/* Buscador y filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="relative w-full sm:w-80">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: '#b8b8b8' }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar producto..."
              className="pl-10 pr-4 py-2 w-full rounded-lg focus:outline-none placeholder-[#b8b8b8] caret-[#e9cc9e]"
              style={{
                backgroundColor: '#2a2a2a',
                color: '#e9cc9e',
                border: '1px solid #3a3a3a',
              }}
            />
          </div>
          {/* Píldoras de clasificación/categorías */}
          <div className="w-full sm:flex-1">
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
              {uniqueClassifications.map((cat) => (
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

        {/* ancla lista */}
        <div ref={listTopRef} />

        {/* Grid de cards */}
        {filtered.length === 0 ? (
          <div
            className="p-10 text-center bg-white rounded-xl"
            style={{
              backgroundColor: '#2a2a2a',
              color: '#b8b8b8',
              border: '1px solid #3a3a3a',
            }}
          >
						No hay productos para mostrar.
          </div>
        ) : (
          <Motion.div
            key={safeCurrentPage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
          >
            {paginated.map((it) => {
              const classification =
								it.food_classification_name ||
								it.clasificacion_name ||
								it.classification ||
								it.food_classification ||
								'';
              const rawCats = Array.isArray(it.categories)
                ? it.categories.map((c) => (typeof c === 'string' ? c : c.name))
                : [];
              const filteredCats = rawCats.filter(
                (n) =>
                  n && n.toLowerCase() !== String(classification).toLowerCase(),
              );
              const visibleCats = filteredCats.slice(0, 2);
              const remainingCats = Math.max(
                0,
                filteredCats.length - visibleCats.length,
              );

              return (
                <div
                  key={it.id}
                  className="rounded-2xl shadow-sm p-5 md:p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all"
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
                        {it.name}
                      </h3>
                      {classification && (
                        <span
                          className="inline-flex text-xs px-2 py-1 rounded-full capitalize mt-1 mr-2"
                          style={{
                            backgroundColor: '#3a3a3a',
                            color: '#e9cc9e',
                          }}
                        >
                          {classification}
                        </span>
                      )}
                      {visibleCats.length > 0 && (
                        <span className="inline-flex flex-wrap gap-1 mt-1">
                          {visibleCats.map((c) => (
                            <span
                              key={c}
                              className="text-[11px] px-2 py-0.5 rounded-full capitalize"
                              style={{
                                backgroundColor: '#3a3a3a',
                                color: '#e9cc9e',
                              }}
                            >
                              {c}
                            </span>
                          ))}
                          {remainingCats > 0 && (
                            <span
                              className="text-[11px]"
                              style={{ color: '#b8b8b8' }}
                            >
															+{remainingCats} más
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ backgroundColor: '#3a3a3a', color: '#e9cc9e' }}
                    >
                      {it.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div
                      className="text-base font-semibold"
                      style={{ color: '#e9cc9e' }}
                    >
											${Number(it.price).toLocaleString('es-CO')}
                    </div>
                  </div>
                  {Array.isArray(it.ingredients) &&
										it.ingredients.length > 0 && (
                    <div className="mt-3">
                      <div
                        className="text-xs mb-1"
                        style={{ color: '#b8b8b8' }}
                      >
													Ingredientes:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {it.ingredients.slice(0, 3).map((ing, idx) => (
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
                        {it.ingredients.length > 3 && (
                          <span
                            className="text-[11px]"
                            style={{ color: '#b8b8b8' }}
                          >
															+{it.ingredients.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => openDetailModal(it)}
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
                        onClick={() => openEditModal(it)}
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
                        onClick={() => openManageModal(it)}
                        className="inline-flex items-center text-sm font-medium px-3 py-1.5 rounded-full"
                        style={{
                          backgroundColor: '#2a2a2a',
                          color: '#e9cc9e',
                          border: '1px solid #3a3a3a',
                        }}
                      >
                        {it.is_active ? (
                          <FiEyeOff className="mr-1" />
                        ) : (
                          <FiEye className="mr-1" />
                        )}{' '}
                        {it.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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

      {/* Modales de comida */}
      <EditFoodModal
        item={selected}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onUpdateSuccess={handleUpdateSuccess}
      />
      <ManageFoodModal
        item={selected}
        isOpen={isManageModalOpen}
        onClose={closeManageModal}
        onUpdateSuccess={handleUpdateSuccess}
      />
      <CocktailDetailModal
        cocktail={selected}
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
      />
    </div>
  );
};

export default FoodAdmin;
