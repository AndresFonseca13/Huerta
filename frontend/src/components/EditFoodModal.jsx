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

	useEffect(() => {
		if (item) {
			setName(item.name || "");
			setPrice(item.price || "");
			setDescription(item.description || "");
			setIngredients(
				item.ingredients
					? item.ingredients.map((ing) =>
							typeof ing === "string" ? { name: ing } : ing
					  )
					: []
			);
			setCategories(
				item.categories
					? item.categories.map((cat) =>
							typeof cat === "string"
								? { name: cat, type: "clasificacion comida" }
								: { ...cat, type: cat.type || "clasificacion comida" }
					  )
					: []
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
				{ name: category.name, type: category.type || "clasificacion comida" },
			]);
		}
		setCategoryInput("");
		setCategorySuggestions([]);
	};

	const removeIngredient = (index) =>
		setIngredients(ingredients.filter((_, i) => i !== index));
	const removeCategory = (index) =>
		setCategories(categories.filter((_, i) => i !== index));
	const handleRemoveImage = (url) => setImages(images.filter((u) => u !== url));
	const handleImageChange = (e) => setNewImageFiles(Array.from(e.target.files));
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
				finalImageUrls = uploadedUrls;
			}
			const updatedData = {
				name: name.trim(),
				price: parseFloat(price),
				description: description.trim(),
				ingredients: ingredients.map((ing) => ing.name),
				categories: categories.map((cat) => ({
					name: cat.name,
					type: cat.type || "clasificacion comida",
				})),
				images: finalImageUrls,
			};
			const result = await updateProduct(item.id, updatedData);
			setIsSuccess(true);
			setTimeout(() => {
				setIsSuccess(false);
				onUpdateSuccess(result.cocktail);
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
					<div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
							✓
						</div>
						<h3 className="text-xl font-bold text-gray-800 mb-2">
							¡Plato Actualizado!
						</h3>
						<p className="text-gray-600">
							El plato "{name}" ha sido actualizado exitosamente.
						</p>
					</div>
				</div>
			)}
			{!isSuccess && (
				<div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
					<div
						className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full relative"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							onClick={onClose}
							className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
							aria-label="Cerrar"
						>
							<FiX size={24} />
						</button>

						<h2 className="text-2xl font-bold text-gray-800 mb-2">
							Editar Plato
						</h2>
						<p className="text-gray-500 mb-4">
							Actualiza la información del plato. Los campos no enviados se
							mantienen.
						</p>

						<form
							onSubmit={handleSubmit}
							className="space-y-4 max-h-[70vh] overflow-y-auto pr-4"
						>
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Nombre
								</label>
								<input
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Precio
								</label>
								<input
									type="number"
									value={price}
									onChange={(e) => setPrice(e.target.value)}
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Descripción
								</label>
								<textarea
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									rows={3}
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
								/>
							</div>

							<div className="relative">
								<label className="block text-sm font-medium text-gray-700">
									Ingredientes
								</label>
								<input
									type="text"
									value={ingredientInput}
									onChange={(e) => handleIngredientSearch(e.target.value)}
									placeholder="Buscar y agregar ingredientes"
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
								/>
								{ingredientSuggestions.length > 0 && (
									<ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
										{ingredientSuggestions.map((s) => (
											<li
												key={s.id}
												onClick={() => addIngredient(s)}
												className="px-4 py-2 cursor-pointer hover:bg-gray-100 capitalize text-gray-900"
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
											className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm"
										>
											<span>{ing.name}</span>
											<button
												type="button"
												onClick={() => removeIngredient(idx)}
												className="ml-2 text-green-600 hover:text-green-800"
											>
												<FiTrash size={14} />
											</button>
										</div>
									))}
								</div>
							</div>

							<div className="relative">
								<label className="block text-sm font-medium text-gray-700">
									Clasificación
								</label>
								<input
									type="text"
									value={categoryInput}
									onChange={(e) => handleCategorySearch(e.target.value)}
									placeholder="Buscar y agregar clasificación"
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
								/>
								{categorySuggestions.length > 0 && (
									<ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
										{categorySuggestions.map((s) => (
											<li
												key={s.id}
												onClick={() => addCategory(s)}
												className="px-4 py-2 cursor-pointer hover:bg-gray-100 capitalize text-gray-900"
											>
												{s.name}
											</li>
										))}
									</ul>
								)}
								<div className="flex flex-wrap gap-2 mt-2">
									{categories.map((cat, idx) => (
										<div
											key={idx}
											className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
										>
											<span>{cat.name}</span>
											<button
												type="button"
												onClick={() => removeCategory(idx)}
												className="ml-2 text-blue-600 hover:text-blue-800"
											>
												<FiTrash size={14} />
											</button>
										</div>
									))}
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700">
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
													className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 leading-none hover:bg-red-600"
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
								<label className="block text-sm font-medium text-gray-700 mt-4">
									Nuevas Imágenes
								</label>
								<div className="mt-2">
									<label
										htmlFor="imagesFood"
										className="cursor-pointer flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-md hover:border-green-500"
									>
										<FiUpload className="mr-2" />
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
											className="flex items-center justify-between text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-md"
										>
											<span>{file.name}</span>
											<button
												type="button"
												onClick={() => handleRemoveNewImage(index)}
												className="text-red-500 hover:text-red-700"
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
									className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
								>
									Cancelar
								</button>
								<button
									type="submit"
									disabled={isSubmitting}
									className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
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
