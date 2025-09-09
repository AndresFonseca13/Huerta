// components/CardCocktail.jsx
import React from "react";
import { motion as Motion } from "framer-motion";
import { FaWineBottle } from "react-icons/fa6";

const CardCocktail = ({ cocktail, onClick }) => {
  const { name, price, description, images } = cocktail;

  const imageUrl =
    images && images.length > 0 && images[0]
      ? images[0]
      : "https://via.placeholder.com/600x400?text=Sin+Imagen";

  const categories = Array.isArray(cocktail.categories)
    ? cocktail.categories.filter(Boolean)
    : [];
  // Preferir etiquetas calculadas por backend: destilado o clasificación de comida
  const primaryCategory =
    cocktail.food_classification_name ||
    cocktail.destilado_name ||
    categories[0] ||
    "Cóctel";

  const capitalize = (s) =>
    typeof s === "string" && s.length > 0
      ? s.charAt(0).toUpperCase() + s.slice(1)
      : s;

  const ingredients = Array.isArray(cocktail.ingredients)
    ? cocktail.ingredients.filter(Boolean).map((i) =>
        typeof i === "string" ? capitalize(i) : capitalize(i?.name)
      )
    : [];

  const alcoholPct =
    cocktail.alcohol_percentage ?? cocktail.alcoholPercentage ?? null;

  return (
    <Motion.div
      className="w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition hover:shadow-xl"
      onClick={() => onClick && onClick(cocktail)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Imagen */}
      <div className="relative">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-56 object-cover"
        />
        {/* Badge de destilado/categoría principal */}
        <div className="absolute top-3 left-3 bg-black/70 text-white text-xs font-semibold px-3 py-1 rounded-full capitalize">
          {primaryCategory}
        </div>
        {/* Porcentaje de alcohol (solo si existe) */}
        {alcoholPct !== null && (
          <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
            <FaWineBottle className="opacity-90" />
            {Number(alcoholPct).toFixed(0)}%
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Título y precio */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-xl font-semibold text-gray-900 capitalize leading-tight">
            {name}
          </h3>
          <div className="text-base font-semibold text-gray-900 whitespace-nowrap">
            ${Number(price).toLocaleString()}
          </div>
        </div>

        {/* Descripción */}
        {description && (
          <p className="text-sm text-gray-600 mb-3">
            {description}
          </p>
        )}

        {/* Separador */}
        <div className="border-t border-gray-200 my-2" />

        {/* Ingredientes */}
        {ingredients.length > 0 && (
          <p className="text-sm italic text-gray-500 line-clamp-2">
            {ingredients.join(", ")}
          </p>
        )}
      </div>
    </Motion.div>
  );
};

export default CardCocktail;
