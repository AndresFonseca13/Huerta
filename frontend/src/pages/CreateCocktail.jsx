import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { searchIngredients } from "../services/ingredientService.js";
import { searchCategories } from "../services/categoryService.js";
import { createCocktail, uploadImages } from "../services/cocktailService.js";
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

const CreateCocktail = () => {
	const [name, setName] = useState("");
	const [price, setPrice] = useState("");
	const [description, setDescription] = useState("");
	// Ingredientes
	const [ingredients, setIngredients] = useState([]);
	const [ingredientInput, setIngredientInput] = useState("");
	const [ingredientSuggestions, setIngredientSuggestions] = useState([]);
	// Categorías
	const [categories, setCategories] = useState([]);
	const [categoryInput, setCategoryInput] = useState("");
	const [categorySuggestions, setCategorySuggestions] = useState([]);
	const [categoryType] = useState("clasificacion");
	// Imágenes
	const [selectedFiles, setSelectedFiles] = useState([]);
	// Estado para mostrar el coctel creado
	const [createdCocktail, setCreatedCocktail] = useState(null);
	const [isCreating, setIsCreating] = useState(false);
	const [error, setError] = useState(null);

	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsCreating(true);
		setError(null);

		// Validación completa del formulario antes de subir imágenes
		const validationErrors = [];

		if (!name.trim()) {
			validationErrors.push("El nombre del cóctel es obligatorio");
		}

		if (!price || parseFloat(price) <= 0) {
			validationErrors.push("El precio debe ser mayor a 0");
		}

		if (!description.trim()) {
			validationErrors.push("La descripción es obligatoria");
		}

		if (ingredients.length === 0) {
			validationErrors.push("Debes agregar al menos un ingrediente");
		}

		if (categories.length === 0) {
			validationErrors.push("Debes agregar al menos una categoría");
		}

		if (selectedFiles.length === 0) {
			validationErrors.push("Debes seleccionar al menos una imagen");
		}

		// Si hay errores de validación, mostrarlos y no continuar
		if (validationErrors.length > 0) {
			setError(validationErrors.join(". "));
			setIsCreating(false);
			return;
		}

		try {
			// 1. Subir imágenes (solo si la validación pasó)
			const imageUrls = await uploadImages(selectedFiles);

			// 2. Preparar objeto del cóctel
			const cocktailData = {
				name: name.trim(),
				price: parseFloat(price),
				description: description.trim(),
				ingredients: ingredients.map((ing) =>
					typeof ing === "string" ? ing : ing.name
				),
				images: imageUrls,
				categories: categories.map((cat) => ({
					name: cat.name,
					type: cat.type,
				})),
			};

			console.log("Datos del cóctel:", cocktailData);

			// 3. Crear cóctel
			const result = await createCocktail(cocktailData);

			// 4. Mostrar el coctel creado
			setCreatedCocktail({
				...result.cocktail,
				images: imageUrls,
			});

			// 5. Limpiar el formulario
			resetForm();
		} catch (error) {
			console.error("Error al crear el cóctel:", error.message);
			setError(error.message);
		} finally {
			setIsCreating(false);
		}
	};

	const resetForm = () => {
		setName("");
		setPrice("");
		setDescription("");
		setIngredients([]);
		setCategories([]);
		setSelectedFiles([]);
		setIngredientInput("");
		setCategoryInput("");
		setIngredientSuggestions([]);
		setCategorySuggestions([]);
	};

	const handleViewCocktails = () => {
		navigate("/");
	};

	const handleCreateAnother = () => {
		setCreatedCocktail(null);
		resetForm();
	};

	// Animaciones
	const overlayVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { duration: 0.3 },
		},
	};

	const cardVariants = {
		hidden: {
			opacity: 0,
			scale: 0.8,
			y: 50,
		},
		visible: {
			opacity: 1,
			scale: 1,
			y: 0,
			transition: {
				duration: 0.5,
				ease: "easeOut",
			},
		},
	};

	const formVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.6 },
		},
	};

	// Si se creó un coctel, mostrar la card
	if (createdCocktail) {
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
						{/* Botón de cerrar */}
						<button
							onClick={handleCreateAnother}
							className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
						>
							×
						</button>

						{/* Mensaje de éxito */}
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
								¡Cóctel Creado!
							</h2>
							<p className="text-gray-600">
								Tu cóctel ha sido creado exitosamente
							</p>
						</div>

						{/* Card del coctel */}
						<div className="mb-6">
							<PreviewCardCocktail cocktail={createdCocktail} />
						</div>

						{/* Botones de acción */}
						<div className="flex flex-col space-y-3">
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={handleViewCocktails}
								className="bg-green-800 text-white px-6 py-3 rounded-lg hover:bg-green-900 transition-colors font-medium"
							>
								Ver Todos los Cócteles
							</motion.button>
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={handleCreateAnother}
								className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
							>
								Crear Otro Cóctel
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
				{/* Header */}
				<div className="text-center mb-8">
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
						className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
					>
						<FiEdit3 className="text-green-600 text-3xl" />
					</motion.div>
					<h1 className="text-4xl font-bold text-green-900 mb-2">
						Crear Nuevo Cóctel
					</h1>
					<p className="text-gray-600 text-lg">
						Completa la información para crear tu cóctel personalizado
					</p>
				</div>

				{/* Formulario */}
				<motion.div
					className="bg-white rounded-2xl shadow-xl p-8"
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.3 }}
				>
					<form onSubmit={handleSubmit} className="space-y-8">
						{/* Información básica */}
						<div className="grid md:grid-cols-2 gap-6">
							{/* Nombre */}
							<div className="space-y-2">
								<label className="flex items-center text-gray-700 font-semibold">
									<FiEdit3 className="mr-2 text-green-600" />
									Nombre del Cóctel
								</label>
								<input
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
									placeholder="Ej. Mojito"
								/>
							</div>

							{/* Precio */}
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
									placeholder="Ej. 8.50"
								/>
							</div>
						</div>

						{/* Descripción */}
						<div className="space-y-2">
							<label className="flex items-center text-gray-700 font-semibold">
								<FiEdit3 className="mr-2 text-green-600" />
								Descripción
							</label>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-24 text-gray-900"
								placeholder="Describe tu cóctel..."
							></textarea>
						</div>

						{/* Ingredientes */}
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
											} catch (error) {
												console.error("Error buscando ingredientes:", error);
												setIngredientSuggestions([]);
											}
										} else {
											setIngredientSuggestions([]);
										}
									}}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
									placeholder="Busca ingredientes..."
									onKeyDown={async (e) => {
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
								<ul className="border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto bg-white">
									{ingredientSuggestions.map((suggestion, index) => (
										<li
											key={index}
											className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-900"
											onClick={() => {
												const ingredientName =
													typeof suggestion === "string"
														? suggestion
														: suggestion.name;
												if (
													!ingredients.some((ing) =>
														typeof ing === "string"
															? ing === ingredientName
															: ing.name === ingredientName
													)
												) {
													setIngredients([...ingredients, suggestion]);
													setIngredientInput("");
													setIngredientSuggestions([]);
												}
											}}
										>
											{typeof suggestion === "string"
												? suggestion
												: suggestion.name}
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
										className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-2"
									>
										<span>
											{typeof ingredient === "string"
												? ingredient
												: ingredient.name}
										</span>
										<button
											type="button"
											onClick={() => {
												const updated = ingredients.filter(
													(_, i) => i !== index
												);
												setIngredients(updated);
											}}
											className="text-green-800 hover:text-red-500"
										>
											<FiTrash />
										</button>
									</div>
								))}
							</div>
						</div>

						{/* Categorías */}
						<div className="space-y-2">
							<label className="flex items-center text-gray-700 font-semibold">
								<FiTag className="mr-2 text-green-600" />
								Categorías
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
											} catch (error) {
												console.error("Error buscando categorías:", error);
												setCategorySuggestions([]);
											}
										} else {
											setCategorySuggestions([]);
										}
									}}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
									placeholder="Busca categorías..."
									onKeyDown={async (e) => {
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
									{categorySuggestions.map((suggestion, index) => (
										<li
											key={index}
											className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-900"
											onClick={() => {
												if (
													!categories.find(
														(c) =>
															c.name === suggestion.name &&
															c.type === suggestion.type
													)
												) {
													setCategories([...categories, suggestion]);
													setCategoryInput("");
													setCategorySuggestions([]);
												}
											}}
										>
											{suggestion.name}
										</li>
									))}
								</ul>
							)}
							<div className="flex flex-wrap gap-2 mt-2">
								{categories.map((category, index) => (
									<div
										key={index}
										className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
									>
										<span>{category.name}</span>
										<button
											type="button"
											onClick={() => {
												const updated = categories.filter(
													(_, i) => i !== index
												);
												setCategories(updated);
											}}
											className="text-blue-800 hover:text-red-500"
										>
											<FiTrash />
										</button>
									</div>
								))}
							</div>
						</div>

						{/* Imágenes */}
						<div className="space-y-2">
							<label className="flex items-center text-gray-700 font-semibold">
								<FiImage className="mr-2 text-green-600" />
								Imágenes
							</label>
							<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
								<input
									type="file"
									multiple
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
												const updated = selectedFiles.filter(
													(_, i) => i !== index
												);
												setSelectedFiles(updated);
											}}
											className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
										>
											<FiTrash />
										</button>
									</div>
								))}
							</div>
						</div>

						{/* Botón de Enviar */}
						<div className="text-center pt-4">
							<motion.button
								type="submit"
								disabled={isCreating}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="bg-green-700 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-green-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
							>
								{isCreating ? "Creando..." : "Crear Cóctel"}
							</motion.button>
						</div>
					</form>
				</motion.div>
			</motion.div>
		</div>
	);
};

export default CreateCocktail;
