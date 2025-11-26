import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import translationService from "../services/translationService";

/**
 * Hook personalizado para traducir productos dinámicamente
 * Traduce nombres, descripciones, ingredientes y categorías
 */
export const useProductTranslation = (product) => {
	const { i18n } = useTranslation();
	const [translatedProduct, setTranslatedProduct] = useState(product);
	const [isTranslating, setIsTranslating] = useState(false);

	useEffect(() => {
		const translateProduct = async () => {
			if (!product) return;

			const currentLang = i18n.language;

			// Si el idioma es español (original), no traducir
			if (currentLang === "es") {
				setTranslatedProduct(product);
				return;
			}

			setIsTranslating(true);

			try {
				// Determinar si es cóctel
				const isCocktail =
					product.categories?.some(
						(cat) =>
							cat.type === "destilado" &&
							(cat.name?.toLowerCase() === "cocktail" ||
								product.destilado_name?.toLowerCase() === "cocktail")
					) ||
					// Verificar si tiene categoría específica de cóctel
					product.categories?.some(
						(cat) =>
							cat.name?.toLowerCase() === "cocktail" &&
							cat.type === "clasificacion"
					);

				// Traducir nombre si NO es cóctel (comida y otras bebidas sí se traducen)
				const translatedName = !isCocktail
					? await translationService.translate(product.name, "es", currentLang)
					: product.name; // Mantener nombre original para cócteles

				// Traducir descripción siempre
				const translatedDescription = product.description
					? await translationService.translate(
							product.description,
							"es",
							currentLang
					  )
					: "";

				// Traducir ingredientes si existen (sin preservar cantidades ya que no las tienen)
				// Procesar secuencialmente para evitar rate limiting
				let translatedIngredients = product.ingredients || [];
				if (
					translatedIngredients.length > 0 &&
					translatedIngredients[0] !== null
				) {
					// Traducir cada ingrediente secuencialmente para evitar 429
					translatedIngredients = [];
					for (const ingredient of product.ingredients.filter(
						(i) => i !== null
					)) {
						const translated = await translationService.translate(
							ingredient,
							"es",
							currentLang,
							false // No preservar cantidades
						);
						translatedIngredients.push(translated);
					}
				}

				// Traducir categorías si existen (procesar secuencialmente)
				let translatedCategories = product.categories || [];
				if (translatedCategories.length > 0) {
					translatedCategories = [];
					for (const cat of product.categories) {
						if (!cat || !cat.name) {
							translatedCategories.push(cat);
							continue;
						}

						const translatedName = await translationService.translate(
							cat.name,
							"es",
							currentLang
						);

						translatedCategories.push({
							...cat,
							name: translatedName,
							originalName: cat.name, // Guardar nombre original
						});
					}
				}

				// Traducir food_classification_name si existe
				let translatedFoodClassification = product.food_classification_name;
				if (product.food_classification_name) {
					translatedFoodClassification = await translationService.translate(
						product.food_classification_name,
						"es",
						currentLang
					);
				}

				// Traducir destilado_name si existe
				let translatedDestiladoName = product.destilado_name;
				if (product.destilado_name) {
					translatedDestiladoName = await translationService.translate(
						product.destilado_name,
						"es",
						currentLang
					);
				}

				setTranslatedProduct({
					...product,
					name: translatedName,
					description: translatedDescription,
					ingredients: translatedIngredients,
					categories: translatedCategories,
					food_classification_name: translatedFoodClassification,
					destilado_name: translatedDestiladoName,
					originalName: product.name, // Guardar nombre original
					originalDescription: product.description,
				});
			} catch (error) {
				console.error("Error translating product:", error);
				console.error("Product that failed:", product.name);
				setTranslatedProduct(product); // En caso de error, usar original
			} finally {
				setIsTranslating(false);
			}
		};

		translateProduct();
	}, [product, i18n.language]);

	return { translatedProduct, isTranslating };
};

/**
 * Hook para traducir un array de productos
 */
export const useProductsTranslation = (products) => {
	const { i18n } = useTranslation();
	const [translatedProducts, setTranslatedProducts] = useState(products);
	const [isTranslating, setIsTranslating] = useState(false);

	useEffect(() => {
		const translateProducts = async () => {
			if (!products || products.length === 0) return;

			const currentLang = i18n.language;

			// Si el idioma es español (original), no traducir
			if (currentLang === "es") {
				setTranslatedProducts(products);
				return;
			}

			setIsTranslating(true);

			try {
				const translated = await Promise.all(
					products.map(async (product) => {
						// Determinar si es cóctel
						const isCocktail =
							product.categories?.some(
								(cat) =>
									cat.type === "destilado" &&
									(cat.name?.toLowerCase() === "cocktail" ||
										product.destilado_name?.toLowerCase() === "cocktail")
							) ||
							// Verificar si tiene categoría específica de cóctel
							product.categories?.some(
								(cat) =>
									cat.name?.toLowerCase() === "cocktail" &&
									cat.type === "clasificacion"
							);

						// Traducir nombre si NO es cóctel (comida y otras bebidas sí se traducen)
						const translatedName = !isCocktail
							? await translationService.translate(
									product.name,
									"es",
									currentLang
							  )
							: product.name;

						// Traducir descripción siempre
						const translatedDescription = product.description
							? await translationService.translate(
									product.description,
									"es",
									currentLang
							  )
							: "";

						// Traducir ingredientes (sin preservar cantidades ya que no las tienen)
						// Procesar secuencialmente para evitar rate limiting
						let translatedIngredients = product.ingredients || [];
						if (
							translatedIngredients.length > 0 &&
							translatedIngredients[0] !== null
						) {
							// Traducir cada ingrediente secuencialmente para evitar 429
							translatedIngredients = [];
							for (const ingredient of product.ingredients.filter(
								(i) => i !== null
							)) {
								const translated = await translationService.translate(
									ingredient,
									"es",
									currentLang,
									false // No preservar cantidades
								);
								translatedIngredients.push(translated);
							}
						}

						// Traducir categorías (procesar secuencialmente)
						let translatedCategories = product.categories || [];
						if (translatedCategories.length > 0) {
							translatedCategories = [];
							for (const cat of product.categories) {
								if (!cat || !cat.name) {
									translatedCategories.push(cat);
									continue;
								}

								const translatedName = await translationService.translate(
									cat.name,
									"es",
									currentLang
								);

								translatedCategories.push({
									...cat,
									name: translatedName,
									originalName: cat.name,
								});
							}
						}

						// Traducir food_classification_name si existe
						let translatedFoodClassification = product.food_classification_name;
						if (product.food_classification_name) {
							translatedFoodClassification = await translationService.translate(
								product.food_classification_name,
								"es",
								currentLang
							);
						}

						// Traducir destilado_name si existe
						let translatedDestiladoName = product.destilado_name;
						if (product.destilado_name) {
							translatedDestiladoName = await translationService.translate(
								product.destilado_name,
								"es",
								currentLang
							);
						}

						return {
							...product,
							name: translatedName,
							description: translatedDescription,
							ingredients: translatedIngredients,
							categories: translatedCategories,
							food_classification_name: translatedFoodClassification,
							destilado_name: translatedDestiladoName,
							originalName: product.name,
							originalDescription: product.description,
						};
					})
				);

				setTranslatedProducts(translated);
			} catch (error) {
				console.error("Error translating products:", error);
				console.error(
					"Products that failed:",
					products.map((p) => p.name).join(", ")
				);
				setTranslatedProducts(products);
			} finally {
				setIsTranslating(false);
			}
		};

		translateProducts();
	}, [products, i18n.language]);

	return { translatedProducts, isTranslating };
};
