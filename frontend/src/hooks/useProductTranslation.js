import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import translationService from '../services/translationService';

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
      if (currentLang === 'es') {
        setTranslatedProduct(product);
        return;
      }

      setIsTranslating(true);

      try {
        // Traducir nombre y descripción
        const [translatedName, translatedDescription] = await Promise.all([
          translationService.translate(product.name, 'es', currentLang),
          product.description 
            ? translationService.translate(product.description, 'es', currentLang)
            : Promise.resolve('')
        ]);

        // Traducir ingredientes si existen
        let translatedIngredients = product.ingredients || [];
        if (translatedIngredients.length > 0 && translatedIngredients[0] !== null) {
          translatedIngredients = await translationService.translateBatch(
            translatedIngredients.filter(i => i !== null),
            'es',
            currentLang
          );
        }

        // Traducir categorías si existen
        let translatedCategories = product.categories || [];
        if (translatedCategories.length > 0) {
          translatedCategories = await Promise.all(
            translatedCategories.map(async (cat) => {
              if (!cat || !cat.name) return cat;
              
              const translatedName = await translationService.translate(
                cat.name,
                'es',
                currentLang
              );
              
              return {
                ...cat,
                name: translatedName,
                originalName: cat.name // Guardar nombre original
              };
            })
          );
        }

        setTranslatedProduct({
          ...product,
          name: translatedName,
          description: translatedDescription,
          ingredients: translatedIngredients,
          categories: translatedCategories,
          originalName: product.name, // Guardar nombre original
          originalDescription: product.description
        });
      } catch (error) {
        console.error('Error translating product:', error);
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
      if (currentLang === 'es') {
        setTranslatedProducts(products);
        return;
      }

      setIsTranslating(true);

      try {
        const translated = await Promise.all(
          products.map(async (product) => {
            // Traducir nombre y descripción
            const [translatedName, translatedDescription] = await Promise.all([
              translationService.translate(product.name, 'es', currentLang),
              product.description
                ? translationService.translate(product.description, 'es', currentLang)
                : Promise.resolve('')
            ]);

            // Traducir ingredientes
            let translatedIngredients = product.ingredients || [];
            if (translatedIngredients.length > 0 && translatedIngredients[0] !== null) {
              translatedIngredients = await translationService.translateBatch(
                translatedIngredients.filter(i => i !== null),
                'es',
                currentLang
              );
            }

            // Traducir categorías
            let translatedCategories = product.categories || [];
            if (translatedCategories.length > 0) {
              translatedCategories = await Promise.all(
                translatedCategories.map(async (cat) => {
                  if (!cat || !cat.name) return cat;
                  
                  const translatedName = await translationService.translate(
                    cat.name,
                    'es',
                    currentLang
                  );
                  
                  return {
                    ...cat,
                    name: translatedName,
                    originalName: cat.name
                  };
                })
              );
            }

            return {
              ...product,
              name: translatedName,
              description: translatedDescription,
              ingredients: translatedIngredients,
              categories: translatedCategories,
              originalName: product.name,
              originalDescription: product.description
            };
          })
        );

        setTranslatedProducts(translated);
      } catch (error) {
        console.error('Error translating products:', error);
        setTranslatedProducts(products);
      } finally {
        setIsTranslating(false);
      }
    };

    translateProducts();
  }, [products, i18n.language]);

  return { translatedProducts, isTranslating };
};

