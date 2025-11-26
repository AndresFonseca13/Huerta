import React, { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
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

const CreateCocktail = () => {
	const [name, setName] = useState("");
	const [price, setPrice] = useState("");
	const [alcoholPercentage, setAlcoholPercentage] = useState("");
	const [description, setDescription] = useState("");
	// Ingredientes
	const [ingredients, setIngredients] = useState([]);
	const [ingredientInput, setIngredientInput] = useState("");
	const [ingredientSuggestions, setIngredientSuggestions] = useState([]);
	// Categorías
	// Tipo por defecto para bebidas
	const [categoryType] = useState("clasificacion");
	// Incluir automáticamente la categoría base "bebida"
	const [categories, setCategories] = useState([
		{ name: "bebida", type: "clasificacion" },
	]);
	const [categoryInput, setCategoryInput] = useState("");
	const [categorySuggestions, setCategorySuggestions] = useState([]);
	// Imágenes
	const [selectedFiles, setSelectedFiles] = useState([]);
	// Estado para mostrar el coctel creado
	const [createdCocktail, setCreatedCocktail] = useState(null);
	const [isCreating, setIsCreating] = useState(false);
	const [error, setError] = useState(null);
	const [showValidation, setShowValidation] = useState(false);

	const navigate = useNavigate();

	const formatPrice = (value) => {
		// Extraer solo los dígitos del valor ingresado
		const numbers = String(value).replace(/\D/g, "");
		if (!numbers) return "";
		// Formatear con separador de miles
		return new Intl.NumberFormat("es-CO").format(parseInt(numbers));
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

	const handleFileChange = (e) => {
		const files = Array.from(e.target.files);
		if (selectedFiles.length + files.length > 5) {
			setError(
				`Solo puedes subir máximo 5 imágenes. Actualmente tienes ${selectedFiles.length}.`
			);
			return;
		}
		setSelectedFiles([...selectedFiles, ...files]);
	};

	useEffect(() => {
		try {
			window.scrollTo({ top: 0, left: 0, behavior: "auto" });
		} catch (_err) {
			// ignore
		}
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		console.log("[CreateBeverage] submit clicked");
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

		// Ingredientes ahora son opcionales para otras bebidas

		if (categories.length === 0) {
			validationErrors.push("Debes agregar al menos una categoría");
		}

		// Imágenes ahora son opcionales para otras bebidas

		// Validación de alcohol si fue diligenciado
		if (alcoholPercentage !== "") {
			const ap = Number(alcoholPercentage);
			if (isNaN(ap) || ap < 0 || ap > 100) {
				validationErrors.push(
					"El porcentaje de alcohol debe estar entre 0 y 100"
				);
			}
		}

		// Si hay errores de validación, mostrarlos y no continuar
		if (validationErrors.length > 0) {
			setError(validationErrors.join(". "));
			setShowValidation(true);
			// Llevar el foco/scroll arriba para que el usuario vea el error
			try {
				window.scrollTo({ top: 0, behavior: "smooth" });
			} catch (_err) {
				// ignore scroll errors
			}
			setIsCreating(false);
			return;
		}

		try {
			console.log(
				"[CreateBeverage] starting uploadImages",
				selectedFiles.length
			);
			// 1. Subir imágenes si fueron seleccionadas
			const imageUrls = selectedFiles.length
				? await uploadImages(selectedFiles, name.trim())
				: [];
			if (selectedFiles.length) {
				console.log("[CreateBeverage] uploadImages OK", imageUrls);
			}

			// 2. Preparar objeto de la bebida
			const cocktailData = {
				name: name.trim(),
				price: parseFloat(price.replace(/\./g, "")),
				description: description.trim(),
				// Solo incluimos ingredientes si hay
				...(ingredients.length > 0 && {
					ingredients: ingredients.map((ing) =>
						typeof ing === "string" ? ing : ing.name
					),
				}),
				images: imageUrls, // puede ser []
				categories: categories.map((cat) => ({
					name: cat.name,
					type: cat.type,
				})),
				// Enviar solo si aplica
				...(alcoholPercentage !== "" && {
					alcohol_percentage: Number(alcoholPercentage),
				}),
			};

			console.log("Datos de la bebida:", cocktailData);

			// 3. Crear cóctel
			console.log("[CreateBeverage] creating product...");
			const result = await createProduct(cocktailData);
			console.log("[CreateBeverage] createProduct OK", result);

			// 4. Mostrar el coctel creado
			setCreatedCocktail({
				...result.product,
				images: imageUrls,
			});

			// 5. Limpiar el formulario
			resetForm();
		} catch (error) {
			console.error("[CreateBeverage] Error:", error);
			const msg = error?.response?.data?.mensaje || error.message;
			if (error?.response?.status === 409) {
				setError(msg || "La bebida ya existe");
			} else {
				setError(msg || "Error inesperado al crear la bebida");
			}
		} finally {
			setIsCreating(false);
		}
	};

	const resetForm = () => {
		setName("");
		setPrice("");
		setDescription("");
		setIngredients([]);
		setCategories([{ name: "bebida", type: "clasificacion" }]);
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

	const handleBackToPanel = () => {
		navigate("/admin");
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

	// Si se creó una bebida, mostrar la card
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
						className="rounded-lg p-4 sm:p-6 md:p-8 max-w-md w-full mx-4 relative max-h-[90vh] overflow-y-auto"
						style={{ backgroundColor: "#2a2a2a", border: "1px solid #3a3a3a" }}
						variants={cardVariants}
						initial="hidden"
						animate="visible"
					>
						{/* Botón de cerrar */}
						<button
							onClick={handleCreateAnother}
							className="absolute top-4 right-4 text-xl"
							style={{ color: "#e9cc9e" }}
						>
							×
						</button>

						{/* Mensaje de éxito */}
						<div className="text-center mb-4 sm:mb-6">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
								className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"
								style={{
									backgroundColor: "#122114",
									border: "1px solid #22c55e",
								}}
							>
								<span
									className="text-xl sm:text-2xl"
									style={{ color: "#22c55e" }}
								>
									✓
								</span>
							</motion.div>
							<h2
								className="text-xl sm:text-2xl font-bold mb-2"
								style={{ color: "#e9cc9e" }}
							>
								¡Bebida Creada!
							</h2>
							<p className="text-sm sm:text-base" style={{ color: "#b8b8b8" }}>
								Tu bebida ha sido creada exitosamente
							</p>
						</div>

						{/* Card de la bebida */}
						<div className="mb-4 sm:mb-6 w-full">
							<PreviewCardCocktail cocktail={createdCocktail} />
						</div>

						{/* Botones de acción */}
						<div className="flex flex-col space-y-2 sm:space-y-3 w-full">
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={handleViewCocktails}
								className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-colors font-medium text-sm sm:text-base"
								style={{ backgroundColor: "#e9cc9e", color: "#191919" }}
							>
								Ver Todas las Bebidas
							</motion.button>
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={handleBackToPanel}
								className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-colors font-medium text-sm sm:text-base"
								style={{
									backgroundColor: "#2a2a2a",
									color: "#e9cc9e",
									border: "1px solid #3a3a3a",
								}}
							>
								Volver al Panel
							</motion.button>
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={handleCreateAnother}
								className="px-6 py-3 rounded-lg transition-colors font-medium"
								style={{
									backgroundColor: "#2a2a2a",
									color: "#e9cc9e",
									border: "1px solid #3a3a3a",
								}}
							>
								Crear Otra Bebida
							</motion.button>
						</div>
					</motion.div>
				</motion.div>
			</div>
		);
	}

	return (
		<div className="min-h-screen py-8" style={{ backgroundColor: "#191919" }}>
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
					<div className="flex justify-between items-center mb-4">
						<button
							onClick={handleBackToPanel}
							className="flex items-center font-medium"
							style={{ color: "#e9cc9e" }}
						>
							← Volver al Panel
						</button>
					</div>
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
						className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
						style={{ backgroundColor: "#3a3a3a" }}
					>
						<FiEdit3 className="text-3xl" style={{ color: "#e9cc9e" }} />
					</motion.div>
					<h1 className="text-4xl font-bold mb-2" style={{ color: "#e9cc9e" }}>
						Crear Nueva Bebida
					</h1>
					<p className="text-lg" style={{ color: "#b8b8b8" }}>
						Completa la información para crear tu bebida
					</p>
				</div>

				{/* Formulario */}
				<motion.div
					className="rounded-2xl shadow-xl p-8"
					style={{ backgroundColor: "#2a2a2a", border: "1px solid #3a3a3a" }}
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.3 }}
				>
					<form onSubmit={handleSubmit} className="space-y-8">
						{/* Información básica */}
						<div className="grid md:grid-cols-2 gap-6">
							{/* Nombre */}
							<div className="space-y-2">
								<label
									className="flex items-center font-semibold"
									style={{ color: "#e9cc9e" }}
								>
									<FiEdit3 className="mr-2" style={{ color: "#e9cc9e" }} />
									Nombre de la Bebida
								</label>
								<input
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="w-full px-4 py-2 border rounded-lg focus:outline-none placeholder-[#b8b8b8] caret-[#e9cc9e]"
									style={{
										backgroundColor: "#2a2a2a",
										color: "#e9cc9e",
										border: "1px solid #3a3a3a",
									}}
									placeholder="Ej. Mojito"
								/>
							</div>

							{/* Precio */}
							<div className="space-y-2">
								<label
									className="flex items-center font-semibold"
									style={{ color: "#e9cc9e" }}
								>
									<FiDollarSign className="mr-2" style={{ color: "#e9cc9e" }} />
									Precio
								</label>
								<input
									type="text"
									value={price}
									onChange={handlePriceChange}
									className="w-full px-4 py-2 border rounded-lg focus:outline-none placeholder-[#b8b8b8] caret-[#e9cc9e]"
									style={{
										backgroundColor: "#2a2a2a",
										color: "#e9cc9e",
										border: "1px solid #3a3a3a",
									}}
									placeholder="0"
								/>
								{price && (
									<p className="text-xs mt-1" style={{ color: "#9a9a9a" }}>
										${price} COP
									</p>
								)}
							</div>

							{/* Porcentaje de alcohol (opcional) */}
							<div className="space-y-2">
								<label
									className="flex items-center font-semibold"
									style={{ color: "#e9cc9e" }}
								>
									<span className="mr-2" style={{ color: "#e9cc9e" }}>
										%
									</span>
									Porcentaje de Alcohol (opcional)
								</label>
								<input
									type="number"
									min="0"
									max="100"
									step="0.1"
									value={alcoholPercentage}
									onChange={(e) => setAlcoholPercentage(e.target.value)}
									className="w-full px-4 py-2 border rounded-lg focus:outline-none placeholder-[#b8b8b8] caret-[#e9cc9e]"
									style={{
										backgroundColor: "#2a2a2a",
										color: "#e9cc9e",
										border: "1px solid #3a3a3a",
									}}
									placeholder="Ej. 40"
								/>
							</div>
						</div>

						{/* Descripción */}
						<div className="space-y-2">
							<label
								className="flex items-center font-semibold"
								style={{ color: "#e9cc9e" }}
							>
								<FiEdit3 className="mr-2" style={{ color: "#e9cc9e" }} />
								Descripción
							</label>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="w-full px-4 py-2 border rounded-lg focus:outline-none h-24 placeholder-[#b8b8b8] caret-[#e9cc9e]"
								style={{
									backgroundColor: "#2a2a2a",
									color: "#e9cc9e",
									border: "1px solid #3a3a3a",
								}}
								placeholder="Describe tu cóctel..."
							></textarea>
						</div>

						{/* Ingredientes */}
						<div className="space-y-2">
							<label
								className="flex items-center font-semibold"
								style={{ color: "#e9cc9e" }}
							>
								<FiPlus className="mr-2" style={{ color: "#e9cc9e" }} />
								Ingredientes{" "}
								<span className="ml-1 text-gray-500 font-normal text-sm">
									(opcional)
								</span>
							</label>
							<p className="text-xs" style={{ color: "#9a9a9a" }}>
								Puedes dejar este campo vacío para otras bebidas como agua,
								sodas, vinos o cervezas.
							</p>
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
									className="w-full px-4 py-2 border rounded-lg focus:outline-none placeholder-[#b8b8b8] caret-[#e9cc9e]"
									style={{
										backgroundColor: "#2a2a2a",
										color: "#e9cc9e",
										border: "1px solid #3a3a3a",
									}}
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
								<ul
									className="rounded-lg mt-1 max-h-40 overflow-y-auto capitalize"
									style={{
										backgroundColor: "#2a2a2a",
										border: "1px solid #3a3a3a",
									}}
								>
									{ingredientSuggestions.map((suggestion, index) => (
										<li
											key={index}
											className="px-4 py-2 cursor-pointer"
											style={{ color: "#e9cc9e" }}
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
								{ingredients.map((ingredient, index) => (
									<div
										key={index}
										className="px-3 py-1 rounded-full flex items-center gap-2 capitalize"
										style={{ backgroundColor: "#3a3a3a", color: "#e9cc9e" }}
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
											className="hover:text-red-500"
											style={{ color: "#e9cc9e" }}
										>
											<FiTrash />
										</button>
									</div>
								))}
							</div>
						</div>

						{/* Categorías */}
						<div className="space-y-2">
							<label
								className="flex items-center font-semibold"
								style={{ color: "#e9cc9e" }}
							>
								<FiTag className="mr-2" style={{ color: "e9cc9e" }} />
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
									className="w-full px-4 py-2 border rounded-lg focus:outline-none placeholder-[#b8b8b8] caret-[#e9cc9e]"
									style={{
										backgroundColor: "#2a2a2a",
										color: "#e9cc9e",
										border: "1px solid #3a3a3a",
									}}
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
								<ul
									className="rounded-lg mt-1 max-h-40 overflow-y-auto"
									style={{
										backgroundColor: "#2a2a2a",
										border: "1px solid #3a3a3a",
									}}
								>
									{categorySuggestions.map((suggestion, index) => (
										<li
											key={index}
											className="px-4 py-2 cursor-pointer"
											style={{ color: "#e9cc9e" }}
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
											<span className="font-medium">{suggestion.name}</span>
											<span className="text-gray-500 text-sm ml-2">
												({suggestion.type})
											</span>
										</li>
									))}
								</ul>
							)}
							<div className="flex flex-wrap gap-2 mt-2">
								{categories.map((category, index) => (
									<div
										key={index}
										className="px-3 py-1 rounded-full flex items-center gap-2"
										style={{ backgroundColor: "#3a3a3a", color: "#e9cc9e" }}
									>
										<span className="font-medium">{category.name}</span>
										<span className="text-xs" style={{ color: "#b8b8b8" }}>
											({category.type})
										</span>
										<button
											type="button"
											onClick={() => {
												const updated = categories.filter(
													(_, i) => i !== index
												);
												setCategories(updated);
											}}
											className="hover:text-red-500"
											style={{ color: "#e9cc9e" }}
										>
											<FiTrash />
										</button>
									</div>
								))}
							</div>
						</div>

						{/* Imágenes */}
						<div className="space-y-2">
							<label
								className="flex items-center font-semibold"
								style={{ color: "#e9cc9e" }}
							>
								<FiImage className="mr-2" style={{ color: "#e9cc9e" }} />
								Imágenes{" "}
								<span className="ml-1 text-gray-500 font-normal text-sm">
									(opcional)
								</span>
							</label>
							<p className="text-xs text-gray-500">
								Puedes omitir imágenes en otras bebidas si no las necesitas.
							</p>
							<div
								className={`border-2 border-dashed rounded-lg p-6 text-center`}
								style={{
									borderColor:
										showValidation && selectedFiles.length === 0
											? "#b91c1c"
											: "#3a3a3a",
									backgroundColor:
										showValidation && selectedFiles.length === 0
											? "#2a1414"
											: "transparent",
									color: "#e9cc9e",
								}}
							>
								<input
									type="file"
									multiple
									accept="image/*"
									onChange={handleFileChange}
									disabled={selectedFiles.length >= 5}
									className="hidden"
									id="file-upload"
								/>
								<label
									htmlFor="file-upload"
									className="cursor-pointer hover:brightness-110"
									style={{ color: "#e9cc9e" }}
								>
									<FiUpload
										className="mx-auto text-3xl mb-2"
										style={{ color: "#e9cc9e" }}
									/>
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
								className="px-8 py-3 rounded-lg font-semibold text-lg transition-colors disabled:cursor-not-allowed"
								style={{ backgroundColor: "#e9cc9e", color: "#191919" }}
							>
								{isCreating ? "Creando..." : "Crear Bebida"}
							</motion.button>
						</div>
					</form>
				</motion.div>
			</motion.div>
		</div>
	);
};

export default CreateCocktail;
