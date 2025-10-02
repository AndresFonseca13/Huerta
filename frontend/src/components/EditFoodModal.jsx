import React, { useEffect, useState } from "react";
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

const EditFoodModal = ({ item, isOpen, onClose, onUpdateSuccess }) => {
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
	const [newImageFiles, setNewImageFiles] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const [isSuccess, setIsSuccess] = useState(false);

	const formatPrice = (value) => {
		const numbers = String(value).replace(/\D/g, "");
		if (!numbers) return "";
		return new Intl.NumberFormat("es-CO").format(parseInt(numbers));
	};

	const handlePriceChange = (e) => {
		const inputValue = e.target.value;
		if (inputValue === "") {
			setPrice("");
			return;
		}
		const formatted = formatPrice(inputValue);
		setPrice(formatted);
	};

	const handleImageChange = (e) => {
		const files = Array.from(e.target.files);
		const totalImages = images.length + newImageFiles.length + files.length;
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

	useEffect(() => {
		if (item) {
			setName(item.name || "");
			const priceValue = item.price || "";
			setPrice(priceValue ? formatPrice(String(priceValue)) : "");
			setDescription(item.description || "");
			setIngredients(
				item.ingredients
					? item.ingredients.map((ing) =>
							typeof ing === "string" ? { name: ing } : ing
					  )
					: []
			);
			const classificationName =
				item.food_classification_name ||
				item.clasificacion_name ||
				item.classification ||
				item.food_classification ||
				"";
			const baseCategories = Array.isArray(item.categories)
				? item.categories.map((cat) => {
						if (typeof cat === "string") {
							const isClass =
								classificationName &&
								cat.toLowerCase() === String(classificationName).toLowerCase();
							return {
								name: cat,
								type: isClass ? "clasificacion" : "categoria",
							};
						}
						const isClass =
							classificationName &&
							cat.name &&
							cat.name.toLowerCase() ===
								String(classificationName).toLowerCase();
						return {
							...cat,
							type: cat.type || (isClass ? "clasificacion" : "categoria"),
						};
				  })
				: [];
			const hasClassification = baseCategories.some(
				(c) =>
					c &&
					c.name &&
					c.name.toLowerCase() === String(classificationName).toLowerCase()
			);
			setCategories(
				hasClassification || !classificationName
					? baseCategories
					: [
							{ name: classificationName, type: "clasificacion" },
							...baseCategories,
					  ]
			);
			setImages(item.images || []);
			setNewImageFiles([]);
		}
	}, [item]);

	const handleIngredientSearch = async (query) => {
		setIngredientInput(query);
		if (query.length > 1) {
			try {
				const results = await searchIngredients(query);
				setIngredientSuggestions(results.ingredients || results || []);
			} catch {
				setIngredientSuggestions([]);
			}
		} else {
			setIngredientSuggestions([]);
		}
	};

	const handleCategorySearch = async (query) => {
		setCategoryInput(query);
		if (query.length > 1) {
			try {
				const results = await searchCategories(query);
				setCategorySuggestions(results.categories || results || []);
			} catch {
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
			setCategories([
				...categories,
				{ name: category.name, type: category.type || "categoria" },
			]);
		}
		setCategoryInput("");
		setCategorySuggestions([]);
	};

	const handleCategoryKeyDown = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			const name = (categoryInput || "").trim();
			if (!name) return;
			if (
				!categories.some((c) => c.name.toLowerCase() === name.toLowerCase())
			) {
				setCategories([...categories, { name, type: "categoria" }]);
			}
			setCategoryInput("");
			setCategorySuggestions([]);
		}
	};

	const removeIngredient = (index) =>
		setIngredients(ingredients.filter((_, i) => i !== index));
	const removeCategory = (index) =>
		setCategories(categories.filter((_, i) => i !== index));
	const handleRemoveImage = (url) => setImages(images.filter((u) => u !== url));
	const handleRemoveNewImage = (i) =>
		setNewImageFiles(newImageFiles.filter((_, idx) => idx !== i));

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);
		setIsSuccess(false);
		try {
			let finalImageUrls = [...images];
			if (newImageFiles.length > 0) {
				const uploadedUrls = await uploadImages(newImageFiles, name.trim());
				finalImageUrls = [...finalImageUrls, ...uploadedUrls];
			}
			const classificationName =
				item.food_classification_name ||
				item.clasificacion_name ||
				item.classification ||
				item.food_classification ||
				"";
			const categoriesWithClassification = (() => {
				const list = categories.map((cat) => ({
					name: cat.name,
					type: cat.type || "categoria",
				}));
				if (classificationName) {
					const exists = list.some(
						(c) =>
							c.name &&
							c.name.toLowerCase() === String(classificationName).toLowerCase()
					);
					if (!exists) {
						list.unshift({
							name: classificationName,
							type: "clasificacion comida",
						});
					}
				}
				return list;
			})();
			const updatedData = {
				name: name.trim(),
				price: parseFloat(price.replace(/\./g, "")),
				description: description.trim(),
				ingredients: ingredients.map((ing) => ing.name),
				categories: categoriesWithClassification,
				images: finalImageUrls,
			};
			console.log("[EditFood] Actualizando con:", updatedData);
			const result = await updateProduct(item.id, updatedData);
			setIsSuccess(true);
			setTimeout(() => {
				setIsSuccess(false);
				onUpdateSuccess(result.product || result.cocktail);
			}, 1500);
		} catch (err) {
			setError(err.message || "Error al actualizar el plato.");
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
						style={{ backgroundColor: "#2a2a2a", border: "1px solid #3a3a3a" }}
					>
						<div
							className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
							style={{ backgroundColor: "#3a3a3a", color: "#e9cc9e" }}
						>
							✓
						</div>
						<h3 className="text-xl font-bold mb-2" style={{ color: "#e9cc9e" }}>
							¡Plato Actualizado!
						</h3>
						<p style={{ color: "#b8b8b8" }}>
							El plato "{name}" ha sido actualizado exitosamente.
						</p>
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
							aria-label="Cerrar"
						>
							<FiX size={24} />
						</button>

						<h2
							className="text-2xl font-bold mb-2"
							style={{ color: "#e9cc9e" }}
						>
							Editar Plato
						</h2>
						<p className="mb-4" style={{ color: "#b8b8b8" }}>
							Actualiza la información del plato. Los campos no enviados se
							mantienen.
						</p>

						<form
							onSubmit={handleSubmit}
							className="space-y-4 max-h-[70vh] overflow-y-auto pr-4"
						>
							<div>
								<label
									className="block text-sm font-medium"
									style={{ color: "#e9cc9e" }}
								>
									Nombre
								</label>
								<input
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none placeholder-[#b8b8b8] caret-[#e9cc9e]"
									style={{
										backgroundColor: "#2a2a2a",
										color: "#e9cc9e",
										border: "1px solid #3a3a3a",
									}}
								/>
							</div>
							<div>
								<label
									className="block text-sm font-medium"
									style={{ color: "#e9cc9e" }}
								>
									Precio
								</label>
								<input
									type="text"
									value={price}
									onChange={handlePriceChange}
									placeholder="0"
									className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none placeholder-[#b8b8b8] caret-[#e9cc9e]"
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
									Descripción
								</label>
								<textarea
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									rows={3}
									className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none placeholder-[#b8b8b8] caret-[#e9cc9e]"
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
									className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none placeholder-[#b8b8b8] caret-[#e9cc9e]"
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
								<div className="flex flex-wrap gap-2 mt-2">
									{ingredients.map((ing, idx) => (
										<div
											key={idx}
											className="flex items-center px-2 py-1 rounded-full text-sm"
											style={{ backgroundColor: "#3a3a3a", color: "#e9cc9e" }}
										>
											<span>{ing.name}</span>
											<button
												type="button"
												onClick={() => removeIngredient(idx)}
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
									Clasificación
								</label>
								<input
									type="text"
									value={categoryInput}
									onChange={(e) => handleCategorySearch(e.target.value)}
									onKeyDown={handleCategoryKeyDown}
									placeholder="Buscar y agregar clasificación"
									className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none placeholder-[#b8b8b8] caret-[#e9cc9e]"
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
								<div className="flex flex-wrap gap-2 mt-2">
									{categories.map((cat, idx) => (
										<div
											key={idx}
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
												onClick={() => removeCategory(idx)}
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
									Imágenes actuales
								</label>
								{images.length > 0 ? (
									<div className="flex flex-wrap gap-4 mt-2">
										{images.map((url, i) => (
											<div key={i} className="relative">
												<img
													src={url}
													alt={`Imagen ${i + 1}`}
													className="h-20 w-20 object-cover rounded-md shadow"
												/>
												<button
													type="button"
													onClick={() => handleRemoveImage(url)}
													className="absolute -top-2 -right-2 rounded-full p-1 leading-none shadow"
													style={{
														backgroundColor: "#2a2a2a",
														border: "1px solid #3a3a3a",
														color: "#e9cc9e",
													}}
												>
													<FiX size={14} />
												</button>
											</div>
										))}
									</div>
								) : (
									<p className="text-sm mt-2" style={{ color: "#9a9a9a" }}>
										No hay imágenes actuales.
									</p>
								)}
							</div>

							<div>
								<label
									className="block text-sm font-medium mt-4"
									style={{ color: "#e9cc9e" }}
								>
									Nuevas Imágenes
								</label>
								<div className="mt-2">
									<label
										htmlFor="imagesFood"
										className="cursor-pointer flex items-center justify-center px-4 py-2 border-2 border-dashed rounded-md"
										style={{ borderColor: "#3a3a3a", color: "#e9cc9e" }}
									>
										<FiUpload className="mr-2" style={{ color: "#e9cc9e" }} />
										<span>Seleccionar nuevas imágenes</span>
									</label>
									<input
										id="imagesFood"
										type="file"
										multiple
										onChange={handleImageChange}
										className="hidden"
									/>
								</div>
								<div className="flex flex-col gap-2 mt-2">
									{newImageFiles.map((file, index) => (
										<div
											key={index}
											className="flex items-center justify-between text-sm px-3 py-2 rounded-md"
											style={{
												backgroundColor: "#2a2a2a",
												border: "1px solid #3a3a3a",
												color: "#e9cc9e",
											}}
										>
											<span>{file.name}</span>
											<button
												type="button"
												onClick={() => handleRemoveNewImage(index)}
												style={{ color: "#e9cc9e" }}
											>
												<FiTrash size={16} />
											</button>
										</div>
									))}
								</div>
							</div>

							<div className="pt-4 flex justify-end space-x-4">
								<button
									type="button"
									onClick={onClose}
									className="px-4 py-2 rounded-md"
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
									className="px-4 py-2 rounded-md disabled:opacity-50"
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

export default EditFoodModal;
