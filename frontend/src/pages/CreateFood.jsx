import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Garantizar uso de motion para linter cuando se usa vía props/variants
void motion;
import { useNavigate } from "react-router-dom";
import { searchIngredients } from "../services/ingredientService.js";
import { searchCategories } from "../services/categoryService.js";
import { uploadImages } from "../services/uploadService.js";
import { createProduct } from "../services/productService.js";
import {
	FiTrash,
	FiPlus,
	FiUpload,
	FiDollarSign,
	FiEdit3,
	FiTag,
	FiImage,
} from "react-icons/fi";
import PreviewCardCocktail from "../components/PreviewCardCocktail";
import ErrorModal from "../components/ErrorModal";

const CreateFood = () => {
	const [name, setName] = useState("");
	const [price, setPrice] = useState("");
	const [description, setDescription] = useState("");
	const [ingredients, setIngredients] = useState([]);
	const [ingredientInput, setIngredientInput] = useState("");
	const [ingredientSuggestions, setIngredientSuggestions] = useState([]);
	// Incluye automáticamente la clasificación base para comida
	const [categories, setCategories] = useState([
		{ name: "comida", type: "clasificacion comida" },
	]);
	const [categoryInput, setCategoryInput] = useState("");
	const [categorySuggestions, setCategorySuggestions] = useState([]);
	const [categoryType] = useState("clasificacion comida");
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [createdItem, setCreatedItem] = useState(null);
	const [isCreating, setIsCreating] = useState(false);
	const [error, setError] = useState(null);
	const [showValidation, setShowValidation] = useState(false);

	const navigate = useNavigate();

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
			transition: { duration: 0.5, ease: "easeOut" },
		},
	};
	const formVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
	};

	const resetForm = () => {
		setName("");
		setPrice("");
		setDescription("");
		setIngredients([]);
		setCategories([{ name: "comida", type: "clasificacion comida" }]);
		setSelectedFiles([]);
		setIngredientInput("");
		setCategoryInput("");
		setIngredientSuggestions([]);
		setCategorySuggestions([]);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsCreating(true);
		setError(null);

		const validationErrors = [];
		if (!name.trim())
			validationErrors.push("El nombre del plato es obligatorio");
		if (!price || parseFloat(price) <= 0)
			validationErrors.push("El precio debe ser mayor a 0");
		if (!description.trim())
			validationErrors.push("La descripción es obligatoria");
		if (ingredients.length === 0)
			validationErrors.push("Debes agregar al menos un ingrediente");
		if (categories.length === 0)
			validationErrors.push("Debes agregar al menos una clasificación");
		if (selectedFiles.length === 0)
			validationErrors.push("Debes seleccionar al menos una imagen");
		if (validationErrors.length > 0) {
			setError(validationErrors.join(". "));
			setShowValidation(true);
			try {
				window.scrollTo({ top: 0, behavior: "smooth" });
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
				price: parseFloat(price),
				description: description.trim(),
				ingredients: ingredients.map((ing) =>
					typeof ing === "string" ? ing : ing.name
				),
				images: imageUrls,
				categories: categories.map((cat) => ({
					name: cat.name,
					type: categoryType,
				})),
			};
			const result = await createProduct(foodData);
			setCreatedItem({ ...result.product, images: imageUrls });
			resetForm();
		} catch (err) {
			const msg = err?.response?.data?.mensaje || err.message;
			if (err?.response?.status === 409) {
				setError(msg || "El plato ya existe");
			} else {
				setError(msg || "Error inesperado al crear el plato");
			}
		} finally {
			setIsCreating(false);
		}
	};

	const handleBackToPanel = () => navigate("/admin");
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
						className="bg-white rounded-lg p-8 max-w-md mx-4 relative"
						variants={cardVariants}
						initial="hidden"
						animate="visible"
					>
						<button
							onClick={handleCreateAnother}
							className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
						>
							×
						</button>
						<div className="text-center mb-6">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
								className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
							>
								<span className="text-green-600 text-2xl">✓</span>
							</motion.div>
							<h2 className="text-2xl font-bold text-green-900 mb-2">
								¡Plato Creado!
							</h2>
							<p className="text-gray-600">
								Tu plato ha sido creado exitosamente
							</p>
						</div>
						<div className="mb-6">
							<PreviewCardCocktail cocktail={createdItem} />
						</div>
						<div className="flex flex-col space-y-3">
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={handleBackToPanel}
								className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
							>
								Volver al Panel
							</motion.button>
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={handleCreateAnother}
								className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 py-8">
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
							className="flex items-center text-green-600 hover:text-green-700 font-medium"
						>
							← Volver al Panel
						</button>
					</div>
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
						className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
					>
						<FiEdit3 className="text-green-600 text-3xl" />
					</motion.div>
					<h1 className="text-4xl font-bold text-green-900 mb-2">
						Crear Nuevo Plato
					</h1>
					<p className="text-gray-600 text-lg">
						Completa la información para crear tu plato
					</p>
				</div>

				<motion.div
					className="bg-white rounded-2xl shadow-xl p-8"
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.3 }}
				>
					<form onSubmit={handleSubmit} className="space-y-8">
						<div className="grid md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<label className="flex items-center text-gray-700 font-semibold">
									<FiEdit3 className="mr-2 text-green-600" />
									Nombre del Plato
								</label>
								<input
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
									placeholder="Ej. Hamburguesa"
								/>
							</div>
							<div className="space-y-2">
								<label className="flex items-center text-gray-700 font-semibold">
									<FiDollarSign className="mr-2 text-green-600" />
									Precio
								</label>
								<input
									type="number"
									value={price}
									onChange={(e) => setPrice(e.target.value)}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
									placeholder="Ej. 25.000"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<label className="flex items-center text-gray-700 font-semibold">
								<FiEdit3 className="mr-2 text-green-600" />
								Descripción
							</label>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-24 text-gray-900"
								placeholder="Describe tu plato..."
							/>
						</div>

						<div className="space-y-2">
							<label className="flex items-center text-gray-700 font-semibold">
								<FiPlus className="mr-2 text-green-600" />
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
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
									placeholder="Busca ingredientes..."
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											const value = e.target.value.trim();
											if (
												value &&
												!ingredients.some((ing) =>
													typeof ing === "string"
														? ing === value
														: ing.name === value
												)
											) {
												setIngredients([...ingredients, value]);
												setIngredientInput("");
												setIngredientSuggestions([]);
											}
										}
									}}
								/>
							</div>
							{ingredientSuggestions.length > 0 && (
								<ul className="border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto bg-white capitalize">
									{ingredientSuggestions.map((s, i) => (
										<li
											key={i}
											className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-900"
											onClick={() => {
												const name = typeof s === "string" ? s : s.name;
												if (
													!ingredients.some((ing) =>
														typeof ing === "string"
															? ing === name
															: ing.name === name
													)
												) {
													setIngredients([...ingredients, s]);
													setIngredientInput("");
													setIngredientSuggestions([]);
												}
											}}
										>
											{typeof s === "string" ? s : s.name}
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
														typeof ing === "string"
															? ing === ingredientInput
															: ing.name === ingredientInput
													)
												) {
													setIngredients([...ingredients, ingredientInput]);
													setIngredientInput("");
													setIngredientSuggestions([]);
												}
											}}
											className="w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 cursor-pointer rounded-lg border-2 border-blue-200 transition-colors duration-150 text-blue-800 font-medium"
										>
											<FiPlus className="inline mr-2 text-blue-600" />
											Agregar nuevo ingrediente: "{ingredientInput}"
										</button>
									</div>
								)}
							<div className="flex flex-wrap gap-2 mt-2">
								{ingredients.map((ingredient, index) => (
									<div
										key={index}
										className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-2 capitalize"
									>
										<span>
											{typeof ingredient === "string"
												? ingredient
												: ingredient.name}
										</span>
										<button
											type="button"
											onClick={() => {
												const upd = ingredients.filter((_, i) => i !== index);
												setIngredients(upd);
											}}
											className="text-green-800 hover:text-red-500"
										>
											<FiTrash />
										</button>
									</div>
								))}
							</div>
						</div>

						<div className="space-y-2">
							<label className="flex items-center text-gray-700 font-semibold">
								<FiTag className="mr-2 text-green-600" />
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
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
									placeholder="Busca clasificación (Entrada, Postre, Fuerte...)"
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											const value = e.target.value.trim();
											if (
												value &&
												!categories.find(
													(c) => c.name === value && c.type === categoryType
												)
											) {
												setCategories([
													...categories,
													{ name: value, type: categoryType },
												]);
												setCategoryInput("");
												setCategorySuggestions([]);
											}
										}
									}}
								/>
							</div>
							{categorySuggestions.length > 0 && (
								<ul className="border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto bg-white">
									{categorySuggestions.map((s, i) => (
										<li
											key={i}
											className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-900"
											onClick={() => {
												if (
													!categories.find(
														(c) =>
															c.name === s.name &&
															c.type === (s.type || categoryType)
													)
												) {
													setCategories([
														...categories,
														{ name: s.name, type: s.type || categoryType },
													]);
													setCategoryInput("");
													setCategorySuggestions([]);
												}
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
										className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
									>
										<span className="font-medium">{cat.name}</span>
										<span className="text-blue-600 text-xs">({cat.type})</span>
										<button
											type="button"
											onClick={() => {
												const upd = categories.filter((_, i) => i !== index);
												setCategories(upd);
											}}
											className="text-blue-800 hover:text-red-500"
										>
											<FiTrash />
										</button>
									</div>
								))}
							</div>
						</div>

						<div className="space-y-2">
							<label className="flex items-center text-gray-700 font-semibold">
								<FiImage className="mr-2 text-green-600" />
								Imágenes
							</label>
							<div
								className={`border-2 border-dashed rounded-lg p-6 text-center ${
									showValidation && selectedFiles.length === 0
										? "border-red-400 bg-red-50"
										: "border-gray-300"
								}`}
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
									className="cursor-pointer text-green-600 hover:text-green-800"
								>
									<FiUpload className="mx-auto text-3xl mb-2" />
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
								className="bg-green-700 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-green-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
							>
								{isCreating ? "Creando..." : "Crear Plato"}
							</motion.button>
						</div>
					</form>
				</motion.div>
			</motion.div>
		</div>
	);
};

export default CreateFood;
