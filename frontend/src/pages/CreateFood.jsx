import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Garantizar uso de motion para linter cuando se usa vía props/variants
void motion;
import { useNavigate } from 'react-router-dom';
import { searchIngredients } from '../services/ingredientService.js';
import { searchCategories } from '../services/categoryService.js';
import { uploadImages } from '../services/uploadService.js';
import { createProduct } from '../services/productService.js';
import {
  FiTrash,
  FiPlus,
  FiUpload,
  FiDollarSign,
  FiEdit3,
  FiTag,
  FiImage,
} from 'react-icons/fi';
import PreviewCardCocktail from '../components/PreviewCardCocktail';
import ErrorModal from '../components/ErrorModal';

const CreateFood = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredientSuggestions, setIngredientSuggestions] = useState([]);
  // Incluye automáticamente la clasificación base para comida
  const [categories, setCategories] = useState([
    { name: 'comida', type: 'clasificacion' },
  ]);
  const [categoryInput, setCategoryInput] = useState('');
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  // Tipos de categoría
  const BASE_CATEGORY_TYPE = 'clasificacion'; // define que es comida
  const FOOD_CATEGORY_TYPE = 'clasificacion comida'; // subclasificación (Entrada, Fuerte, etc.)
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [createdItem, setCreatedItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [showValidation, setShowValidation] = useState(false);

  const navigate = useNavigate();

  // Formateo de precio como en crear bebidas (separador de miles)
  const formatPrice = (value) => {
    const numbers = String(value).replace(/\D/g, '');
    if (!numbers) return '';
    return new Intl.NumberFormat('es-CO').format(parseInt(numbers));
  };

  const handlePriceChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      setPrice('');
      return;
    }
    setPrice(formatPrice(inputValue));
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setDescription('');
    setIngredients([]);
    setCategories([{ name: 'comida', type: BASE_CATEGORY_TYPE }]);
    setSelectedFiles([]);
    setIngredientInput('');
    setCategoryInput('');
    setIngredientSuggestions([]);
    setCategorySuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    const validationErrors = [];
    if (!name.trim())
      validationErrors.push('El nombre del plato es obligatorio');
    if (!price || parseFloat(price) <= 0)
      validationErrors.push('El precio debe ser mayor a 0');
    if (!description.trim())
      validationErrors.push('La descripción es obligatoria');
    if (ingredients.length === 0)
      validationErrors.push('Debes agregar al menos un ingrediente');
    if (categories.length === 0)
      validationErrors.push('Debes agregar al menos una clasificación');
    if (selectedFiles.length === 0)
      validationErrors.push('Debes seleccionar al menos una imagen');
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      setShowValidation(true);
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (_err) {
        /* noop */
      }
      setIsCreating(false);
      return;
    }

    try {
      const imageUrls = await uploadImages(selectedFiles, name.trim());
      const foodData = {
        name: name.trim(),
        price: parseFloat(String(price).replace(/\./g, '')),
        description: description.trim(),
        ingredients: ingredients.map((ing) =>
          typeof ing === 'string' ? ing : ing.name,
        ),
        images: imageUrls,
        // Preservar el type de cada categoría (evita duplicar "comida")
        categories: categories.map((cat) => ({
          name: cat.name,
          type: cat.type,
        })),
      };
      const result = await createProduct(foodData);
      setCreatedItem({ ...result.product, images: imageUrls });
      resetForm();
    } catch (err) {
      const msg = err?.response?.data?.mensaje || err.message;
      if (err?.response?.status === 409) {
        setError(msg || 'El plato ya existe');
      } else {
        setError(msg || 'Error inesperado al crear el plato');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleBackToPanel = () => navigate('/admin');
  const handleCreateAnother = () => {
    setCreatedItem(null);
    resetForm();
  };

  if (createdItem) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="rounded-lg p-4 sm:p-6 md:p-8 max-w-md w-full mx-4 relative max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a' }}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <button
              onClick={handleCreateAnother}
              className="absolute top-4 right-4 text-xl"
              style={{ color: '#e9cc9e' }}
            >
							×
            </button>
            <div className="text-center mb-4 sm:mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"
                style={{
                  backgroundColor: '#122114',
                  border: '1px solid #22c55e',
                }}
              >
                <span
                  className="text-xl sm:text-2xl"
                  style={{ color: '#22c55e' }}
                >
									✓
                </span>
              </motion.div>
              <h2
                className="text-xl sm:text-2xl font-bold mb-2"
                style={{ color: '#e9cc9e' }}
              >
								¡Plato Creado!
              </h2>
              <p className="text-sm sm:text-base" style={{ color: '#b8b8b8' }}>
								Tu plato ha sido creado exitosamente
              </p>
            </div>
            <div className="mb-4 sm:mb-6 w-full">
              <PreviewCardCocktail cocktail={createdItem} />
            </div>
            <div className="flex flex-col space-y-2 sm:space-y-3 w-full">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBackToPanel}
                className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-colors font-medium text-sm sm:text-base"
                style={{ backgroundColor: '#e9cc9e', color: '#191919' }}
              >
								Volver al Panel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateAnother}
                className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-colors font-medium text-sm sm:text-base"
                style={{
                  backgroundColor: '#2a2a2a',
                  color: '#e9cc9e',
                  border: '1px solid #3a3a3a',
                }}
              >
								Crear Otro Plato
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: '#191919' }}>
      <AnimatePresence>
        {error && <ErrorModal message={error} onClose={() => setError(null)} />}
      </AnimatePresence>
      <motion.div
        className="max-w-4xl mx-auto px-6"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handleBackToPanel}
              className="flex items-center font-medium"
              style={{ color: '#e9cc9e' }}
            >
							← Volver al Panel
            </button>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#3a3a3a' }}
          >
            <FiEdit3 className="text-3xl" style={{ color: '#e9cc9e' }} />
          </motion.div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#e9cc9e' }}>
						Crear Nuevo Plato
          </h1>
          <p className="text-lg" style={{ color: '#b8b8b8' }}>
						Completa la información para crear tu plato
          </p>
        </div>

        <motion.div
          className="rounded-2xl shadow-xl p-8"
          style={{ backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a' }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  className="flex items-center font-semibold"
                  style={{ color: '#e9cc9e' }}
                >
                  <FiEdit3 className="mr-2" style={{ color: '#e9cc9e' }} />
									Nombre del Plato
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none placeholder-[#b8b8b8] caret-[#e9cc9e]"
                  style={{
                    backgroundColor: '#2a2a2a',
                    color: '#e9cc9e',
                    border: '1px solid #3a3a3a',
                  }}
                  placeholder="Ej. Hamburguesa"
                />
              </div>
              <div className="space-y-2">
                <label
                  className="flex items-center font-semibold"
                  style={{ color: '#e9cc9e' }}
                >
                  <FiDollarSign className="mr-2" style={{ color: '#e9cc9e' }} />
									Precio
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={handlePriceChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none placeholder-[#b8b8b8] caret-[#e9cc9e]"
                  style={{
                    backgroundColor: '#2a2a2a',
                    color: '#e9cc9e',
                    border: '1px solid #3a3a3a',
                  }}
                  placeholder="0"
                />
                {price && (
                  <p className="text-xs mt-1" style={{ color: '#9a9a9a' }}>
										${price} COP
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="flex items-center font-semibold"
                style={{ color: '#e9cc9e' }}
              >
                <FiEdit3 className="mr-2" style={{ color: '#e9cc9e' }} />
								Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none h-24 placeholder-[#b8b8b8] caret-[#e9cc9e]"
                style={{
                  backgroundColor: '#2a2a2a',
                  color: '#e9cc9e',
                  border: '1px solid #3a3a3a',
                }}
                placeholder="Describe tu plato..."
              />
            </div>

            <div className="space-y-2">
              <label
                className="flex items-center font-semibold"
                style={{ color: '#e9cc9e' }}
              >
                <FiPlus className="mr-2" style={{ color: '#e9cc9e' }} />
								Ingredientes
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={ingredientInput}
                  onChange={async (e) => {
                    const value = e.target.value;
                    setIngredientInput(value);
                    if (value.length > 1) {
                      try {
                        const results = await searchIngredients(value);
                        setIngredientSuggestions(results.ingredients || []);
                      } catch {
                        setIngredientSuggestions([]);
                      }
                    } else {
                      setIngredientSuggestions([]);
                    }
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none placeholder-[#b8b8b8] caret-[#e9cc9e]"
                  style={{
                    backgroundColor: '#2a2a2a',
                    color: '#e9cc9e',
                    border: '1px solid #3a3a3a',
                  }}
                  placeholder="Busca ingredientes..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = e.target.value.trim();
                      if (
                        value &&
												!ingredients.some((ing) =>
												  typeof ing === 'string'
												    ? ing === value
												    : ing.name === value,
												)
                      ) {
                        setIngredients([...ingredients, value]);
                        setIngredientInput('');
                        setIngredientSuggestions([]);
                      }
                    }
                  }}
                />
              </div>
              {ingredientSuggestions.length > 0 && (
                <ul
                  className="rounded-lg mt-1 max-h-40 overflow-y-auto capitalize"
                  style={{
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #3a3a3a',
                  }}
                >
                  {ingredientSuggestions.map((s, i) => (
                    <li
                      key={i}
                      className="px-4 py-2 cursor-pointer"
                      style={{ color: '#e9cc9e' }}
                      onClick={() => {
                        const name = typeof s === 'string' ? s : s.name;
                        if (
                          !ingredients.some((ing) =>
                            typeof ing === 'string'
                              ? ing === name
                              : ing.name === name,
                          )
                        ) {
                          setIngredients([...ingredients, s]);
                          setIngredientInput('');
                          setIngredientSuggestions([]);
                        }
                      }}
                    >
                      {typeof s === 'string' ? s : s.name}
                    </li>
                  ))}
                </ul>
              )}
              {ingredientInput &&
								ingredientInput.length > 1 &&
								ingredientSuggestions.length === 0 && (
                <div className="mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        !ingredients.some((ing) =>
                          typeof ing === 'string'
                            ? ing === ingredientInput
                            : ing.name === ingredientInput,
                        )
                      ) {
                        setIngredients([...ingredients, ingredientInput]);
                        setIngredientInput('');
                        setIngredientSuggestions([]);
                      }
                    }}
                    className="w-full px-4 py-2 cursor-pointer rounded-lg transition-colors duration-150 font-medium"
                    style={{
                      backgroundColor: '#3a3a3a',
                      color: '#e9cc9e',
                      border: '1px solid #4a4a4a',
                    }}
                  >
                    <FiPlus
                      className="inline mr-2"
                      style={{ color: '#e9cc9e' }}
                    />
											Agregar nuevo ingrediente: "{ingredientInput}"
                  </button>
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="px-3 py-1 rounded-full flex items-center gap-2 capitalize"
                    style={{ backgroundColor: '#3a3a3a', color: '#e9cc9e' }}
                  >
                    <span>
                      {typeof ingredient === 'string'
                        ? ingredient
                        : ingredient.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const upd = ingredients.filter((_, i) => i !== index);
                        setIngredients(upd);
                      }}
                      className="hover:text-red-500"
                      style={{ color: '#e9cc9e' }}
                    >
                      <FiTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="flex items-center font-semibold"
                style={{ color: '#e9cc9e' }}
              >
                <FiTag className="mr-2" style={{ color: '#e9cc9e' }} />
								Clasificación
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={categoryInput}
                  onChange={async (e) => {
                    const value = e.target.value;
                    setCategoryInput(value);
                    if (value.length > 1) {
                      try {
                        const results = await searchCategories(value);
                        setCategorySuggestions(results.categories || []);
                      } catch {
                        setCategorySuggestions([]);
                      }
                    } else {
                      setCategorySuggestions([]);
                    }
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none placeholder-[#b8b8b8] caret-[#e9cc9e]"
                  style={{
                    backgroundColor: '#2a2a2a',
                    color: '#e9cc9e',
                    border: '1px solid #3a3a3a',
                  }}
                  placeholder="Busca clasificación (Entrada, Postre, Fuerte...)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = e.target.value.trim();
                      if (value) {
                        // No permitir duplicar la base "comida"; si escribe comida, usar la existente
                        if (
                          value.toLowerCase() === 'comida' &&
													categories.some(
													  (c) =>
													    c.name.toLowerCase() === 'comida' &&
															c.type === BASE_CATEGORY_TYPE,
													)
                        ) {
                          // ya está presente, no agregar
                        } else if (
                          !categories.find(
                            (c) =>
                              c.name.toLowerCase() === value.toLowerCase() &&
															c.type === FOOD_CATEGORY_TYPE,
                          )
                        ) {
                          setCategories([
                            ...categories,
                            { name: value, type: FOOD_CATEGORY_TYPE },
                          ]);
                        }
                        setCategoryInput('');
                        setCategorySuggestions([]);
                      }
                    }
                  }}
                />
              </div>
              {categorySuggestions.length > 0 && (
                <ul
                  className="rounded-lg mt-1 max-h-40 overflow-y-auto"
                  style={{
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #3a3a3a',
                  }}
                >
                  {categorySuggestions.map((s, i) => (
                    <li
                      key={i}
                      className="px-4 py-2 cursor-pointer"
                      style={{ color: '#e9cc9e' }}
                      onClick={() => {
                        const suggestedName = (s.name || '').toLowerCase();
                        const resolvedType =
													s.type ||
													(suggestedName === 'comida'
													  ? BASE_CATEGORY_TYPE
													  : FOOD_CATEGORY_TYPE);
                        if (
                          !categories.find(
                            (c) =>
                              c.name.toLowerCase() === suggestedName &&
															c.type === resolvedType,
                          )
                        ) {
                          setCategories([
                            ...categories,
                            { name: s.name, type: resolvedType },
                          ]);
                        }
                        setCategoryInput('');
                        setCategorySuggestions([]);
                      }}
                    >
                      <span className="font-medium">{s.name}</span>
                      <span className="text-gray-500 text-sm ml-2">
												({s.type})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map((cat, index) => (
                  <div
                    key={index}
                    className="px-3 py-1 rounded-full flex items-center gap-2"
                    style={{ backgroundColor: '#3a3a3a', color: '#e9cc9e' }}
                  >
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-xs" style={{ color: '#b8b8b8' }}>
											({cat.type})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const upd = categories.filter((_, i) => i !== index);
                        setCategories(upd);
                      }}
                      className="hover:text-red-500"
                      style={{ color: '#e9cc9e' }}
                    >
                      <FiTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="flex items-center font-semibold"
                style={{ color: '#e9cc9e' }}
              >
                <FiImage className="mr-2" style={{ color: '#e9cc9e' }} />
								Imágenes
              </label>
              <div
                className={'border-2 border-dashed rounded-lg p-6 text-center'}
                style={{
                  borderColor:
										showValidation && selectedFiles.length === 0
										  ? '#b91c1c'
										  : '#3a3a3a',
                  backgroundColor:
										showValidation && selectedFiles.length === 0
										  ? '#2a1414'
										  : 'transparent',
                  color: '#e9cc9e',
                }}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer hover:brightness-110"
                  style={{ color: '#e9cc9e' }}
                >
                  <FiUpload
                    className="mx-auto text-3xl mb-2"
                    style={{ color: '#e9cc9e' }}
                  />
                  <span>Selecciona o arrastra las imágenes aquí</span>
                </label>
              </div>
              {showValidation && selectedFiles.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
									Debes seleccionar al menos una imagen.
                </p>
              )}
              <div className="grid grid-cols-3 gap-4 mt-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`preview ${index}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const upd = selectedFiles.filter((_, i) => i !== index);
                        setSelectedFiles(upd);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      <FiTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center pt-4">
              <motion.button
                type="submit"
                disabled={isCreating}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-lg font-semibold text-lg transition-colors disabled:cursor-not-allowed"
                style={{ backgroundColor: '#e9cc9e', color: '#191919' }}
              >
                {isCreating ? 'Creando...' : 'Crear Plato'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CreateFood;
