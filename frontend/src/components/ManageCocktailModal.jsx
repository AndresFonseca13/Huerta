import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  FiX,
  FiEye,
  FiEyeOff,
  FiTrash2,
  FiAlertTriangle,
} from 'react-icons/fi';
import { updateProductStatus, deleteProduct } from '../services/productService';
import ErrorModal from './ErrorModal';
import { useTranslation } from 'react-i18next';
import { useProductTranslation } from '../hooks/useProductTranslation';

const ManageCocktailModal = ({
  cocktail,
  isOpen,
  onClose,
  onUpdateSuccess,
}) => {
  console.log('[DEBUG] ManageCocktailModal - Cocktail recibido:', cocktail);

  const { t } = useTranslation();
  const { translatedProduct } = useProductTranslation(cocktail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newStatus, setNewStatus] = useState(null); // Para guardar el nuevo estado después del toggle

  const handleToggleStatus = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Si is_active es null, lo tratamos como false
      const currentStatus =
				cocktail.is_active === null ? false : cocktail.is_active;
      const newStatus = !currentStatus;

      console.log('[DEBUG] ManageCocktailModal - Cambiando estado:', {
        cocktailId: cocktail.id,
        currentStatus,
        newStatus,
        originalIsActive: cocktail.is_active,
      });

      const result = await updateProductStatus(cocktail.id, newStatus);

      // Guardar el nuevo estado para mostrar el mensaje correcto
      setNewStatus(newStatus);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setNewStatus(null);
        onUpdateSuccess(result.cocktail);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error al cambiar el estado del cóctel.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhysicalDelete = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await deleteProduct(cocktail.id);
      setShowDeleteConfirm(false);
      onUpdateSuccess(null); // null indica que se eliminó
    } catch (err) {
      setError(err.message || 'Error al eliminar el cóctel.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
      {isSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
          <div
            className="rounded-lg shadow-xl p-8 max-w-md w-full text-center"
            style={{ backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a' }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#3a3a3a' }}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="#e9cc9e"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#e9cc9e' }}>
              {t('manageCocktail.successTitle')}
            </h3>
            <p style={{ color: '#b8b8b8' }}>
              {newStatus === false
                ? t('manageCocktail.cocktailDisabled', { name: translatedProduct.name })
                : newStatus === true
                  ? t('manageCocktail.cocktailEnabled', { name: translatedProduct.name })
                  : ''}
            </p>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
          <div
            className="rounded-lg shadow-xl p-8 max-w-md w-full text-center"
            style={{ backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a' }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{
                backgroundColor: '#2a1414',
                border: '1px solid #b91c1c',
              }}
            >
              <FiAlertTriangle
                className="w-8 h-8"
                style={{ color: '#b91c1c' }}
              />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#e9cc9e' }}>
              {t('manageCocktail.deleteConfirmTitle')}
            </h3>
            <p className="mb-6" style={{ color: '#b8b8b8' }}>
              {t('manageCocktail.deleteWarning', { name: translatedProduct.name })}
            </p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: '#2a2a2a',
                  color: '#e9cc9e',
                  border: '1px solid #3a3a3a',
                  WebkitAppearance: 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {t('manageCocktail.cancel')}
              </button>
              <button
                onClick={handlePhysicalDelete}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: '#b91c1c',
                  color: '#ffffff',
                  border: '1px solid #7f1d1d',
                  WebkitAppearance: 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {isSubmitting ? t('manageCocktail.deleting') : t('manageCocktail.deleteDefinitively')}
              </button>
            </div>
          </div>
        </div>
      )}
      {!isSuccess && !showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <div
            className="rounded-lg shadow-xl p-8 max-w-2xl w-full relative"
            style={{ backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4"
              style={{
                color: '#e9cc9e',
                WebkitAppearance: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
              aria-label="Cerrar modal"
            >
              <FiX size={24} />
            </button>

            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: '#e9cc9e' }}
            >
              {t('manageCocktail.title')}
            </h2>

            {/* Información del cóctel */}
            <div
              className="rounded-lg p-6 mb-6"
              style={{
                backgroundColor: '#2a2a2a',
                border: '1px solid #3a3a3a',
              }}
            >
              <h3
                className="text-lg font-semibold mb-4 capitalize"
                style={{ color: '#e9cc9e' }}
              >
                {translatedProduct.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium" style={{ color: '#e9cc9e' }}>
                    {t('manageCocktail.price')}:
                  </span>
                  <span className="ml-2" style={{ color: '#b8b8b8' }}>
										${cocktail.price}
                  </span>
                </div>
                <div>
                  <span className="font-medium" style={{ color: '#e9cc9e' }}>
                    {t('manageCocktail.active')}:
                  </span>
                  <span
                    className="ml-2"
                    style={{
                      color: cocktail.is_active ? '#22c55e' : '#b91c1c',
                    }}
                  >
                    {cocktail.is_active ? t('manageCocktail.active') : t('manageCocktail.inactive')}
                  </span>
                </div>
                <div>
                  <span className="font-medium" style={{ color: '#e9cc9e' }}>
                    {t('manageCocktail.ingredients')}:
                  </span>
                  <span className="ml-2" style={{ color: '#b8b8b8' }}>
                    {cocktail.ingredients?.length || 0}
                  </span>
                </div>
                <div>
                  <span className="font-medium" style={{ color: '#e9cc9e' }}>
                    {t('manageCocktail.categories')}:
                  </span>
                  <span className="ml-2" style={{ color: '#b8b8b8' }}>
                    {cocktail.categories?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Opciones de gestión */}
            <div className="space-y-4">
              {/* Toggle de estado */}
              <div
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ border: '1px solid #3a3a3a' }}
              >
                <div className="flex items-center">
                  {cocktail.is_active ? (
                    <FiEye
                      className="w-5 h-5 mr-3"
                      style={{ color: '#22c55e' }}
                    />
                  ) : (
                    <FiEyeOff
                      className="w-5 h-5 mr-3"
                      style={{ color: '#b91c1c' }}
                    />
                  )}
                  <div>
                    <h4 className="font-medium" style={{ color: '#e9cc9e' }}>
                      {cocktail.is_active
                        ? t('manageCocktail.enabledInMenu')
                        : t('manageCocktail.disabledInMenu')}
                    </h4>
                    <p className="text-sm" style={{ color: '#b8b8b8' }}>
                      {cocktail.is_active
                        ? t('manageCocktail.customersCanSee')
                        : t('manageCocktail.customersCannotSee')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggleStatus}
                  disabled={isSubmitting}
                  className={'px-4 py-2 rounded-md transition-colors disabled:opacity-50'}
                  style={{
                    backgroundColor: cocktail.is_active ? '#2a1414' : '#122114',
                    border: `1px solid ${
                      cocktail.is_active ? '#b91c1c' : '#22c55e'
                    }`,
                    color: cocktail.is_active ? '#fca5a5' : '#86efac',
                    WebkitAppearance: 'none',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {isSubmitting
                    ? t('manageCocktail.processing')
                    : cocktail.is_active
                      ? t('manageCocktail.disable')
                      : t('manageCocktail.enable')}
                </button>
              </div>

              {/* Eliminación física */}
              <div
                className="flex items-center justify-between p-4 rounded-lg"
                style={{
                  border: '1px solid #7f1d1d',
                  backgroundColor: '#2a1414',
                }}
              >
                <div className="flex items-center">
                  <FiTrash2
                    className="w-5 h-5 mr-3"
                    style={{ color: '#b91c1c' }}
                  />
                  <div>
                    <h4 className="font-medium" style={{ color: '#fca5a5' }}>
                      {t('manageCocktail.permanentDeletion')}
                    </h4>
                    <p className="text-sm" style={{ color: '#fca5a5' }}>
                      {t('manageCocktail.permanentDeletionDesc')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: '#b91c1c',
                    color: '#ffffff',
                    border: '1px solid #7f1d1d',
                    WebkitAppearance: 'none',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {t('manageCocktail.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ManageCocktailModal;
