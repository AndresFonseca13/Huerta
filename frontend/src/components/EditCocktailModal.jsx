import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import {
	FiX,
	FiEdit3,
	FiDollarSign,
	FiUpload,
	FiTrash,
	FiPlus,
} from "react-icons/fi";
import { searchIngredients } from "../services/ingredientService.js";
import { searchCategories } from "../services/categoryService.js";
import { updateProduct } from "../services/productService.js";
import { uploadImages } from "../services/uploadService.js";
import ErrorModal from "./ErrorModal";

const EditCocktailModal = ({ cocktail, isOpen, onClose, onUpdateSuccess }) => {
	const [name, setName] = useState("");
	const [price, setPrice] = useState("");
	const [description, setDescription] = useState("");
	const [ingredients, setIngredients] = useState([]);
	const [ingredientInput, setIngredientInput] = useState("");
	const [ingredientSuggestions, setIngredientSuggestions] = useState([]);
	const [categories, setCategories] = useState([]);
	const [categoryInput, setCategoryInput] = useState("");
	const [categorySuggestions, setCategorySuggestions] = useState([]);
	const [images, setImages] = useState([]);
	const [alcoholPercentage, setAlcoholPercentage] = useState("");
	const [newImageFiles, setNewImageFiles] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const [isSuccess, setIsSuccess] = useState(false);

	// Formateo de precio para dos contextos:
	// - fromBackend: valores tipo "46000.00" → 46.000 sin multiplicar por 100
	// - typing (default): extraer dígitos para no romper el cursor al escribir
	const formatPrice = (value, { fromBackend = false } = {}) => {
		if (fromBackend) {
			let num;
			if (typeof value === "number") {
				num = value;
			} else {
				const normalized = String(value)
					.trim()
					.replace(/[^0-9.,]/g, "")
					.replace(/,/g, ".");
				num = parseFloat(normalized);
			}
			if (!isFinite(num)) return "";
			return new Intl.NumberFormat("es-CO").format(Math.round(num));
		}
		const numbersOnly = String(value).replace(/\D/g, "");
		if (!numbersOnly) return "";
		return new Intl.NumberFormat("es-CO").format(parseInt(numbersOnly));
	};

	const handlePriceChange = (e) => {
		const inputValue = e.target.value;
		// Solo formatear si hay contenido
		if (inputValue === "") {
			setPrice("");
			return;
		}
		const formatted = formatPrice(inputValue);
		setPrice(formatted);
	};

	useEffect(() => {
		if (cocktail) {
			setName(cocktail.name || "");
			// Formatear el precio al cargar desde backend (puede venir "46000.00")
			const priceValue = cocktail.price || "";
			setPrice(
				priceValue ? formatPrice(priceValue, { fromBackend: true }) : ""
			);
			setDescription(cocktail.description || "");
			setIngredients(
				cocktail.ingredients
					? cocktail.ingredients.map((ing) =>
							typeof ing === "string" ? { name: ing } : ing
					  )
					: []
			);
			setCategories(
				cocktail.categories
					? cocktail.categories.map((cat) =>
							typeof cat === "string"
								? { name: cat, type: "clasificacion" }
								: { name: cat.name, type: cat.type }
					  )
					: []
			);
			setImages(cocktail.images || []);
			setAlcoholPercentage(
				cocktail.alcohol_percentage ?? cocktail.alcoholPercentage ?? ""
			);
			setNewImageFiles([]);
		}
	}, [cocktail]);

	const handleIngredientSearch = async (query) => {
		setIngredientInput(query);
		console.log(`[DEBUG] Buscando ingrediente con término: "${query}"`);
		if (query.length > 1) {
			try {
				const results = await searchIngredients(query);
				console.log("[DEBUG] Resultados de ingredientes recibidos:", results);
				setIngredientSuggestions(results.ingredients || results || []);
				console.log(
					"[DEBUG] Estado ingredientSuggestions actualizado con:",
					(results.ingredients || results || []).length,
					"elementos"
				);
			} catch (error) {
				console.error("[DEBUG] ERROR buscando ingredientes:", error);
				setIngredientSuggestions([]);
			}
		} else {
			setIngredientSuggestions([]);
		}
	};

	const handleCategorySearch = async (query) => {
		setCategoryInput(query);
		console.log(`[DEBUG] Buscando categoría con término: "${query}"`);
		if (query.length > 1) {
			try {
				const results = await searchCategories(query);
				console.log("[DEBUG] Resultados de categorías recibidos:", results);
				setCategorySuggestions(results.categories || results || []);
				console.log(
					"[DEBUG] Estado categorySuggestions actualizado con:",
					(results.categories || results || []).length,
					"elementos"
				);
			} catch (error) {
				console.error("[DEBUG] ERROR buscando categorías:", error);
				setCategorySuggestions([]);
			}
		} else {
			setCategorySuggestions([]);
		}
	};

	const addIngredient = (ingredient) => {
		if (!ingredients.some((i) => i.name === ingredient.name)) {
			setIngredients([...ingredients, ingredient]);
		}
		setIngredientInput("");
		setIngredientSuggestions([]);
	};

	const addCategory = (category) => {
		if (!categories.some((c) => c.name === category.name)) {
			setCategories([...categories, category]);
		}
		setCategoryInput("");
		setCategorySuggestions([]);
	};

	const removeIngredient = (index) => {
		setIngredients(ingredients.filter((_, i) => i !== index));
	};

	const removeCategory = (index) => {
		setCategories(categories.filter((_, i) => i !== index));
	};

	const handleRemoveImage = (urlToRemove) => {
		setImages(images.filter((url) => url !== urlToRemove));
	};

	const handleImageChange = (e) => {
		const files = Array.from(e.target.files);
		const totalImages = images.length + newImageFiles.length + files.length;

		// Validar que no exceda el máximo de 5 imágenes
		if (totalImages > 5) {
			setError(
				`Solo puedes tener máximo 5 imágenes. Actualmente tienes ${
					images.length + newImageFiles.length
				}.`
			);
			return;
		}

		setNewImageFiles([...newImageFiles, ...files]);
	};

	const handleRemoveNewImage = (indexToRemove) => {
		setNewImageFiles(
			newImageFiles.filter((_, index) => index !== indexToRemove)
		);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);
		setIsSuccess(false);

		try {
			// Empezar con las imágenes existentes que NO fueron eliminadas manualmente
			let finalImageUrls = [...images];

			// Si se seleccionaron nuevas imágenes, subirlas y AGREGARLAS a las existentes
			if (newImageFiles.length > 0) {
				const uploadedUrls = await uploadImages(newImageFiles, name.trim());
				// AGREGAR las nuevas imágenes a las existentes (no reemplazar)
				finalImageUrls = [...finalImageUrls, ...uploadedUrls];
			}

			const updatedData = {
				name: name.trim(),
				price: parseFloat(price.replace(/\./g, "")), // Remover separadores de miles
				description: description.trim(),
				ingredients: ingredients.map((ing) => ing.name),
				categories: categories.map((cat) => ({
					name: cat.name,
					type: cat.type || "destilado",
				})),
				images: finalImageUrls, // Envía todas las imágenes (antiguas + nuevas)
				...(alcoholPercentage !== "" && {
					alcohol_percentage: Number(alcoholPercentage),
				}),
			};

			console.log("[EditCocktail] Actualizando con:", updatedData);
			const result = await updateProduct(cocktail.id, updatedData);
			setIsSuccess(true);

			setTimeout(() => {
				setIsSuccess(false);
				onUpdateSuccess(result.cocktail || result.product);
			}, 2000);
		} catch (err) {
			setError(err.message || "Error al actualizar el cóctel.");
			console.error(err);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!isOpen) return null;

	console.log(
		"[DEBUG] Render - ingredientSuggestions:",
		ingredientSuggestions.length,
		"categorySuggestions:",
		categorySuggestions.length
	);

	return (
		<AnimatePresence>
			{error && <ErrorModal message={error} onClose={() => setError(null)} />}
			{isSuccess && (
				<div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
					<div
						className="rounded-lg shadow-xl p-8 max-w-md w-full text-center"
						style={{ backgroundColor: "#2a2a2a", border: "1px solid #3a3a3a" }}
					>
						<div
							className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
							style={{ backgroundColor: "#3a3a3a" }}
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
						<h3 className="text-xl font-bold mb-2" style={{ color: "#e9cc9e" }}>
							¡Cóctel Actualizado!
						</h3>
						<p style={{ color: "#b8b8b8" }}>
							El cóctel "{name}" ha sido actualizado exitosamente.
						</p>
						<div className="mt-6">
							<div
								className="w-8 h-1 rounded-full mx-auto animate-pulse"
								style={{ backgroundColor: "#e9cc9e" }}
							></div>
						</div>
					</div>
				</div>
			)}
			{!isSuccess && (
				<div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
					<div
						className="rounded-lg shadow-xl p-8 max-w-2xl w-full relative"
						style={{ backgroundColor: "#2a2a2a", border: "1px solid #3a3a3a" }}
						onClick={(e) => e.stopPropagation()}
					>
						<button
							onClick={onClose}
							className="absolute top-4 right-4"
							style={{ color: "#e9cc9e" }}
							aria-label="Cerrar modal"
						>
							<FiX size={24} />
						</button>

						<h2
							className="text-2xl font-bold mb-2"
							style={{ color: "#e9cc9e" }}
						>
							Editar Cóctel
						</h2>
						<p className="mb-4" style={{ color: "#b8b8b8" }}>
							Actualiza la información del cóctel. Los campos no enviados se
							mantienen.
						</p>

						<form
							onSubmit={handleSubmit}
							className="space-y-4 max-h-[70vh] overflow-y-auto pr-4"
						>
							<div>
								<label
									htmlFor="name"
									className="block text-sm font-medium"
									style={{ color: "#e9cc9e" }}
								>
									Nombre
								</label>
								<input
									id="name"
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none placeholder-[#b8b8b8] caret-[#e9cc9e]"
									style={{
										backgroundColor: "#2a2a2a",
										color: "#e9cc9e",
										border: "1px solid #3a3a3a",
									}}
								/>
							</div>
							<div>
								<label
									htmlFor="price"
									className="block text-sm font-medium"
									style={{ color: "#e9cc9e" }}
								>
									Precio
								</label>
								<input
									id="price"
									type="text"
									value={price}
									onChange={handlePriceChange}
									placeholder="0"
									className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none placeholder-[#b8b8b8] caret-[#e9cc9e]"
									style={{
										backgroundColor: "#2a2a2a",
										color: "#e9cc9e",
										border: "1px solid #3a3a3a",
									}}
								/>
								{price && (
									<p className="text-xs mt-1" style={{ color: "#9a9a9a" }}>
										${price} COP
									</p>
								)}
							</div>
							<div>
								<label
									className="block text-sm font-medium"
									style={{ color: "#e9cc9e" }}
								>
									% Porcentaje de Alcohol (opcional)
								</label>
								<input
									type="number"
									min="0"
									max="100"
									step="0.1"
									value={alcoholPercentage}
									onChange={(e) => setAlcoholPercentage(e.target.value)}
									className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none placeholder-[#b8b8b8] caret-[#e9cc9e]"
									style={{
										backgroundColor: "#2a2a2a",
										color: "#e9cc9e",
										border: "1px solid #3a3a3a",
									}}
									placeholder="Ej. 40"
								/>
							</div>
							<div>
								<label
									htmlFor="description"
									className="block text-sm font-medium"
									style={{ color: "#e9cc9e" }}
								>
									Descripción
								</label>
								<textarea
									id="description"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									rows={3}
									className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none placeholder-[#b8b8b8] caret-[#e9cc9e]"
									style={{
										backgroundColor: "#2a2a2a",
										color: "#e9cc9e",
										border: "1px solid #3a3a3a",
									}}
								/>
							</div>

							<div className="relative">
								<label
									className="block text-sm font-medium"
									style={{ color: "#e9cc9e" }}
								>
									Ingredientes
								</label>
								<input
									type="text"
									value={ingredientInput}
									onChange={(e) => handleIngredientSearch(e.target.value)}
									placeholder="Buscar y agregar ingredientes"
									className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none placeholder-[#b8b8b8] caret-[#e9cc9e]"
									style={{
										backgroundColor: "#2a2a2a",
										color: "#e9cc9e",
										border: "1px solid #3a3a3a",
									}}
								/>
								{ingredientSuggestions.length > 0 && (
									<ul
										className="absolute z-10 w-full rounded-md shadow-lg max-h-40 overflow-y-auto"
										style={{
											backgroundColor: "#2a2a2a",
											border: "1px solid #3a3a3a",
										}}
									>
										{ingredientSuggestions.map((s) => (
											<li
												key={s.id}
												onClick={() => addIngredient(s)}
												className="px-4 py-2 cursor-pointer capitalize"
												style={{ color: "#e9cc9e" }}
											>
												{s.name}
											</li>
										))}
									</ul>
								)}
								{/* Opción para agregar nuevo ingrediente */}
								{ingredientInput &&
									ingredientInput.length > 1 &&
									ingredientSuggestions.length === 0 && (
										<div className="mt-1">
											<button
												type="button"
												onClick={() => {
													if (
														!ingredients.some(
															(ing) => ing.name === ingredientInput
														)
													) {
														setIngredients([
															...ingredients,
															{ name: ingredientInput },
														]);
														setIngredientInput("");
														setIngredientSuggestions([]);
													}
												}}
												className="w-full px-4 py-2 cursor-pointer rounded-lg transition-colors duration-150 font-medium"
												style={{
													backgroundColor: "#3a3a3a",
													color: "#e9cc9e",
													border: "1px solid #4a4a4a",
												}}
											>
												<FiPlus
													className="inline mr-2"
													style={{ color: "#e9cc9e" }}
												/>
												Agregar nuevo ingrediente: "{ingredientInput}"
											</button>
										</div>
									)}
								<div className="flex flex-wrap gap-2 mt-2">
									{ingredients.map((ing, index) => (
										<div
											key={index}
											className="flex items-center px-2 py-1 rounded-full text-sm"
											style={{ backgroundColor: "#3a3a3a", color: "#e9cc9e" }}
										>
											<span>{ing.name}</span>
											<button
												type="button"
												onClick={() => removeIngredient(index)}
												className="ml-2"
												style={{ color: "#e9cc9e" }}
											>
												<FiTrash size={14} />
											</button>
										</div>
									))}
								</div>
							</div>

							<div className="relative">
								<label
									className="block text-sm font-medium"
									style={{ color: "#e9cc9e" }}
								>
									Categorías
								</label>
								<input
									type="text"
									value={categoryInput}
									onChange={(e) => handleCategorySearch(e.target.value)}
									placeholder="Buscar y agregar categorías"
									className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none placeholder-[#b8b8b8] caret-[#e9cc9e]"
									style={{
										backgroundColor: "#2a2a2a",
										color: "#e9cc9e",
										border: "1px solid #3a3a3a",
									}}
								/>
								{categorySuggestions.length > 0 && (
									<ul
										className="absolute z-10 w-full rounded-md shadow-lg max-h-40 overflow-y-auto"
										style={{
											backgroundColor: "#2a2a2a",
											border: "1px solid #3a3a3a",
										}}
									>
										{categorySuggestions.map((s) => (
											<li
												key={s.id}
												onClick={() => addCategory(s)}
												className="px-4 py-2 cursor-pointer capitalize"
												style={{ color: "#e9cc9e" }}
											>
												<span className="font-medium">{s.name}</span>
												<span
													className="text-sm ml-2"
													style={{ color: "#b8b8b8" }}
												>
													({s.type})
												</span>
											</li>
										))}
									</ul>
								)}
								{/* Opción para agregar nueva categoría */}
								{categoryInput &&
									categoryInput.length > 1 &&
									categorySuggestions.length === 0 && (
										<div className="mt-1">
											<button
												type="button"
												onClick={() => {
													if (
														!categories.some(
															(cat) => cat.name === categoryInput
														)
													) {
														setCategories([
															...categories,
															{ name: categoryInput, type: "clasificacion" },
														]);
														setCategoryInput("");
														setCategorySuggestions([]);
													}
												}}
												className="w-full px-4 py-2 cursor-pointer rounded-lg transition-colors duration-150 font-medium"
												style={{
													backgroundColor: "#3a3a3a",
													color: "#e9cc9e",
													border: "1px solid #4a4a4a",
												}}
											>
												<FiPlus
													className="inline mr-2"
													style={{ color: "#e9cc9e" }}
												/>
												Agregar nueva categoría: "{categoryInput}"
											</button>
										</div>
									)}
								<div className="flex flex-wrap gap-2 mt-2">
									{categories.map((cat, index) => (
										<div
											key={index}
											className="flex items-center px-2 py-1 rounded-full text-sm"
											style={{ backgroundColor: "#3a3a3a", color: "#e9cc9e" }}
										>
											<span className="font-medium">{cat.name}</span>
											<span
												className="text-xs ml-1"
												style={{ color: "#b8b8b8" }}
											>
												({cat.type})
											</span>
											<button
												type="button"
												onClick={() => removeCategory(index)}
												className="ml-2"
												style={{ color: "#e9cc9e" }}
											>
												<FiTrash size={14} />
											</button>
										</div>
									))}
								</div>
							</div>

							<div>
								<label
									className="block text-sm font-medium"
									style={{ color: "#e9cc9e" }}
								>
									Imágenes Actuales
								</label>
								{images.length > 0 ? (
									<div className="flex flex-wrap gap-4 mt-2">
										{images.map((url, i) => (
											<div key={i} className="relative">
												<img
													src={url}
													alt={`Imagen actual ${i + 1}`}
													className="h-20 w-20 object-cover rounded-md shadow-md"
												/>
												<button
													type="button"
													onClick={() => handleRemoveImage(url)}
													className="absolute -top-2 -right-2 rounded-full p-1 leading-none shadow-lg transition-colors"
													style={{
														backgroundColor: "#2a2a2a",
														border: "1px solid #3a3a3a",
														color: "#e9cc9e",
													}}
													aria-label="Eliminar imagen"
												>
													<FiX size={14} />
												</button>
											</div>
										))}
									</div>
								) : (
									<p className="text-sm text-gray-500 mt-2">
										No hay imágenes actuales.
									</p>
								)}
							</div>

							<div>
								<label
									className="block text-sm font-medium mt-4"
									style={{ color: "#e9cc9e" }}
								>
									Agregar Nuevas Imágenes {images.length + newImageFiles.length}
									/5
								</label>
								<p className="text-xs mb-2" style={{ color: "#9a9a9a" }}>
									Las nuevas imágenes se agregarán a las existentes (máximo 5
									imágenes en total).
								</p>
								<div className="mt-2">
									<label
										htmlFor="images"
										className={`cursor-pointer flex items-center justify-center px-4 py-2 border-2 border-dashed rounded-md`}
										style={{
											borderColor:
												images.length + newImageFiles.length >= 5
													? "#4a4a4a"
													: "#3a3a3a",
											color: "#e9cc9e",
											backgroundColor:
												images.length + newImageFiles.length >= 5
													? "#2a2a2a"
													: "transparent",
										}}
									>
										<FiUpload className="mr-2" style={{ color: "#e9cc9e" }} />
										<span>
											{images.length + newImageFiles.length >= 5
												? "Máximo de imágenes alcanzado"
												: "Seleccionar nuevas imágenes"}
										</span>
									</label>
									<input
										id="images"
										type="file"
										multiple
										accept="image/*"
										onChange={handleImageChange}
										disabled={images.length + newImageFiles.length >= 5}
										className="hidden"
									/>
								</div>
								{newImageFiles.length > 0 && (
									<div className="grid grid-cols-3 gap-4 mt-4">
										{newImageFiles.map((file, index) => (
											<div key={index} className="relative">
												<img
													src={URL.createObjectURL(file)}
													alt={`preview ${index}`}
													className="w-full h-24 object-cover rounded-lg"
												/>
												<button
													type="button"
													onClick={() => handleRemoveNewImage(index)}
													className="absolute -top-2 -right-2 rounded-full p-1 shadow-lg"
													style={{
														backgroundColor: "#2a2a2a",
														border: "1px solid #3a3a3a",
														color: "#e9cc9e",
													}}
													aria-label="Eliminar imagen nueva"
												>
													<FiX size={14} />
												</button>
											</div>
										))}
									</div>
								)}
							</div>

							<div className="pt-4 flex justify-end space-x-4">
								<button
									type="button"
									onClick={onClose}
									className="px-4 py-2 rounded-md transition-colors"
									style={{
										backgroundColor: "#2a2a2a",
										color: "#e9cc9e",
										border: "1px solid #3a3a3a",
									}}
								>
									Cancelar
								</button>
								<button
									type="submit"
									disabled={isSubmitting}
									className="px-4 py-2 rounded-md transition-colors disabled:opacity-50"
									style={{ backgroundColor: "#e9cc9e", color: "#191919" }}
								>
									{isSubmitting ? "Actualizando..." : "Guardar Cambios"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</AnimatePresence>
	);
};

export default EditCocktailModal;
