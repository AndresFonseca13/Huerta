import React, { useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { FaWineBottle } from 'react-icons/fa6';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './CocktailDetailModal.css';
import { useTranslation } from 'react-i18next';
import { useProductTranslation } from '../hooks/useProductTranslation';

const OrnamentalDivider = () => (
  <div className="flex items-center justify-center gap-3 my-5">
    <div className="h-px w-12" style={{ backgroundColor: '#3a3a3a' }} />
    <div
      className="w-1.5 h-1.5 rotate-45"
      style={{ backgroundColor: '#e9cc9e' }}
    />
    <div className="h-px w-12" style={{ backgroundColor: '#3a3a3a' }} />
  </div>
);

const CocktailDetailModal = ({ cocktail, isOpen, onClose }) => {
  const { t } = useTranslation();
  const { translatedProduct } = useProductTranslation(cocktail);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen || !cocktail) return null;

  const productToShow = translatedProduct || cocktail;
  const { name, price, description, images, ingredients } = productToShow;
  const alcoholPct =
    cocktail.alcohol_percentage ?? cocktail.alcoholPercentage ?? null;
  const destilado = cocktail.destilado_name || null;
  const foodClass = cocktail.food_classification_name || null;
  const categoryLabel = foodClass || destilado || null;

  const capitalize = (s) =>
    typeof s === 'string' && s.length > 0
      ? s.charAt(0).toUpperCase() + s.slice(1)
      : s;

  const imageList =
    images && images.length > 0 ? images : null;

  return (
    <AnimatePresence>
      <Motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      >
        <Motion.div
          className="rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative"
          style={{
            backgroundColor: '#1e1e1e',
            border: '1px solid #2a2a2a',
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botón de cerrar – sutil */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 rounded-full p-1.5 transition-all duration-200 hover:scale-110"
            style={{
              backgroundColor: 'rgba(30,30,30,0.8)',
              border: '1px solid #3a3a3a',
              WebkitAppearance: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <FiX className="text-base" style={{ color: '#8a8a8a' }} />
          </button>

          {/* Imagen – contenida y elegante */}
          {imageList && (
            <div className="px-6 pt-6">
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2a2a2a' }}>
                {imageList.length > 1 ? (
                  <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    navigation
                    pagination={{ clickable: true }}
                    className="w-full aspect-[16/10]"
                    spaceBetween={0}
                    loop={true}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                  >
                    {imageList.map((img, idx) => (
                      <SwiperSlide key={idx}>
                        <img
                          src={img}
                          alt={name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              'https://via.placeholder.com/400x250?text=Error+Imagen';
                          }}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : (
                  <img
                    src={imageList[0]}
                    alt={name}
                    className="w-full aspect-[16/10] object-cover"
                    onError={(e) => {
                      e.target.src =
                        'https://via.placeholder.com/400x250?text=Error+Imagen';
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Contenido – estilo menú */}
          <div className="px-6 pb-6 pt-2">
            <OrnamentalDivider />

            {/* Nombre */}
            <Motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-2xl sm:text-3xl font-bold text-center capitalize tracking-wide leading-tight"
              style={{ color: '#e9cc9e' }}
            >
              {name}
            </Motion.h2>

            {/* Subtítulo: categoría · alcohol */}
            {(categoryLabel || alcoholPct !== null) && (
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-2 mt-2"
              >
                {categoryLabel && (
                  <span
                    className="text-xs font-medium capitalize tracking-wider uppercase"
                    style={{ color: '#7a7a6a' }}
                  >
                    {categoryLabel}
                  </span>
                )}
                {categoryLabel && alcoholPct !== null && (
                  <span style={{ color: '#4a4a4a' }}>·</span>
                )}
                {alcoholPct !== null && (
                  <span
                    className="text-xs font-medium flex items-center gap-1"
                    style={{ color: '#7a7a6a' }}
                  >
                    <FaWineBottle className="text-[10px]" />
                    {Number(alcoholPct).toFixed(0)}%
                  </span>
                )}
              </Motion.div>
            )}

            {/* Precio – elegante y centrado */}
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-center mt-3"
            >
              <span
                className="text-xl font-semibold tracking-wide"
                style={{ color: '#e9cc9e' }}
              >
                ${Number(price).toLocaleString()}
              </span>
            </Motion.div>

            <OrnamentalDivider />

            {/* Descripción */}
            {description && (
              <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p
                  className="text-sm sm:text-base leading-relaxed text-center italic"
                  style={{ color: '#a0a0a0' }}
                >
                  &ldquo;{description}&rdquo;
                </p>
              </Motion.div>
            )}

            {/* Ingredientes */}
            {ingredients && ingredients.length > 0 && (
              <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <OrnamentalDivider />
                <h3
                  className="text-xs font-medium uppercase tracking-[0.2em] text-center mb-3"
                  style={{ color: '#6a6a6a' }}
                >
                  {t('cocktailDetail.ingredients')}
                </h3>
                <p
                  className="text-sm text-center capitalize leading-relaxed"
                  style={{ color: '#9a9a9a' }}
                >
                  {ingredients
                    .map((ingredient) => {
                      const value =
                        typeof ingredient === 'string'
                          ? ingredient
                          : ingredient.name;
                      return capitalize(value);
                    })
                    .join('  ·  ')}
                </p>
              </Motion.div>
            )}

            <OrnamentalDivider />

            {/* Botón cerrar – sutil */}
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <button
                onClick={onClose}
                className="text-xs uppercase tracking-[0.15em] font-medium py-2 px-6 rounded-full transition-all duration-200 hover:opacity-80"
                style={{
                  color: '#8a8a8a',
                  border: '1px solid #3a3a3a',
                  backgroundColor: 'transparent',
                }}
              >
                {t('cocktailDetail.close')}
              </button>
            </Motion.div>
          </div>
        </Motion.div>
      </Motion.div>
    </AnimatePresence>
  );
};

export default CocktailDetailModal;
