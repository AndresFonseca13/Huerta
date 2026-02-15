// components/CardCocktail.jsx
import React from 'react';
import { FaWineBottle } from 'react-icons/fa6';
import { useProductTranslation } from '../hooks/useProductTranslation';

const CardCocktail = ({ cocktail, onClick }) => {
  const { translatedProduct } = useProductTranslation(cocktail);
  const { name, price, description, images } = translatedProduct;

  const imageUrl =
		images && images.length > 0 && images[0]
		  ? images[0]
		  : null;

  const categories = Array.isArray(translatedProduct.categories)
    ? translatedProduct.categories.filter(Boolean)
    : [];

  const primaryCategory =
		translatedProduct.food_classification_name ||
		translatedProduct.destilado_name ||
		categories[0]?.name ||
		categories[0] ||
		'Cóctel';

  const capitalize = (s) =>
    typeof s === 'string' && s.length > 0
      ? s.charAt(0).toUpperCase() + s.slice(1)
      : s;

  const ingredients = Array.isArray(translatedProduct.ingredients)
    ? translatedProduct.ingredients
      .filter(Boolean)
      .map((i) =>
        typeof i === 'string' ? capitalize(i) : capitalize(i?.name),
      )
    : [];

  const alcoholPct =
		translatedProduct.alcohol_percentage ??
		translatedProduct.alcoholPercentage ??
		null;

  return (
    <div
      className="w-full cursor-pointer transition-all duration-200 hover:bg-[#2f2f2f] flex flex-row gap-4 p-4 rounded-xl group"
      style={{
        backgroundColor: 'transparent',
        borderBottom: '1px solid #2a2a2a',
      }}
      onClick={() => onClick && onClick(cocktail)}
    >
      {/* Imagen pequeña redonda */}
      {imageUrl && (
        <div className="flex-shrink-0 self-start">
          <img
            src={imageUrl}
            alt={name}
            className="w-20 h-20 rounded-full object-cover border-2 transition-transform duration-300 group-hover:scale-105"
            style={{ borderColor: '#3a3a3a' }}
            loading="lazy"
            decoding="async"
          />
        </div>
      )}

      {/* Contenido textual */}
      <div className="flex-grow min-w-0">
        {/* Fila: Nombre ··· Precio */}
        <div className="flex items-baseline gap-2 mb-1">
          <h3
            className="text-lg font-semibold capitalize leading-tight truncate"
            style={{ color: '#e9cc9e' }}
          >
            {name}
          </h3>
          {/* Línea punteada de relleno */}
          <div
            className="flex-grow border-b border-dotted mx-1"
            style={{ borderColor: '#4a4a4a', minWidth: '20px', marginBottom: '4px' }}
          />
          {/* Precio */}
          <span
            className="text-base font-semibold whitespace-nowrap flex-shrink-0"
            style={{ color: '#e9cc9e' }}
          >
            ${Number(price).toLocaleString()}
          </span>
        </div>

        {/* Tags: categoría + alcohol */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span
            className="text-xs font-medium capitalize tracking-wide"
            style={{ color: '#8a8a7a' }}
          >
            {primaryCategory}
          </span>
          {alcoholPct !== null && (
            <>
              <span style={{ color: '#4a4a4a' }}>·</span>
              <span
                className="text-xs font-medium flex items-center gap-1"
                style={{ color: '#8a8a7a' }}
              >
                <FaWineBottle className="text-[10px] opacity-70" />
                {Number(alcoholPct).toFixed(0)}%
              </span>
            </>
          )}
        </div>

        {/* Descripción */}
        {description && (
          <p
            className="text-sm leading-relaxed line-clamp-2 mb-1.5"
            style={{ color: '#9a9a9a' }}
            title={description}
          >
            {description}
          </p>
        )}

        {/* Ingredientes */}
        {ingredients.length > 0 && (
          <p
            className="text-xs italic line-clamp-1"
            style={{ color: '#6a6a6a' }}
            title={ingredients.join(', ')}
          >
            {ingredients.join(' · ')}
          </p>
        )}
      </div>
    </div>
  );
};

export default CardCocktail;
