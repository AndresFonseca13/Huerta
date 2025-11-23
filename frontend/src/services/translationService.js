/**
 * Servicio de traducción con caché en localStorage
 * Utiliza MyMemory Translation API (gratuita)
 */

const CACHE_KEY = "huerta_translations_cache";
const API_URL = "https://api.mymemory.translated.net/get";

// Lista de marcas y nombres propios que NO deben traducirse
const NO_TRANSLATE_BRANDS = [
	// Marcas de tequila
	"herradura",
	"altos plata",
	"patrón",
	"don julio",
	"jose cuervo",
	"1800",
	"casa noble",
	"el jimador",
	"milagro",
	// Marcas de ron
	"bacardí",
	"bacardi",
	"captain morgan",
	"havana club",
	"mount gay",
	// Marcas de whisky
	"johnnie walker",
	"jack daniels",
	"jameson",
	"chivas",
	"crown royal",
	"glenfiddich",
	"glenlivet",
	"macallan",
	"jim beam",
	"wild turkey",
	// Marcas de vodka
	"absolut",
	"grey goose",
	"smirnoff",
	"ketel one",
	// Marcas de ginebra
	"bombay",
	"tanqueray",
	"hendrick's",
	// Otras marcas comunes
	"campari",
	"aperol",
	"fernet",
	"jägermeister",
	"baileys",
	"albaricoque",
	"limonaria",
	"panna",
	"tres cordilleras mestiza",
	"tres cordilleras mulata",
];

// Tipos de destilados que NO deben traducirse (solo el tipo, no la marca)
const NO_TRANSLATE_SPIRITS = [
	"tequila",
	"ron",
	"whisky",
	"whiskey",
	"vodka",
	"ginebra",
	"gin",
	"brandy",
	"coñac",
	"cognac",
	"pisco",
	"mezcal",
	"rum",
	"bourbon",
	"scotch",
];

/**
 * Detecta si un texto ES una marca o nombre de producto que no debe traducirse
 * Solo bloquea si el texto completo ES una marca, no si solo contiene una marca
 */
function shouldNotTranslate(text) {
	if (!text || typeof text !== "string") return false;

	const lowerText = text.toLowerCase().trim();
	const words = text.trim().split(/\s+/);

	// Verificar si ES una marca conocida (búsqueda exacta)
	for (const brand of NO_TRANSLATE_BRANDS) {
		// Búsqueda exacta
		if (lowerText === brand) return true;
	}

	// Verificar si es un patrón corto: "tipo de destilado + marca" (2-4 palabras máximo)
	// Ejemplo: "tequila herradura", "ron bacardí", "tequila herradura reposado", "whisky glenfiddich 12"
	// Pero NO: "Cóctel preparado con Tequila Herradura y jugo de limón" (muchas palabras)
	if (words.length >= 2 && words.length <= 4) {
		const firstWord = words[0].toLowerCase();

		// Si la primera palabra es un tipo de destilado
		if (NO_TRANSLATE_SPIRITS.includes(firstWord)) {
			// Verificar si alguna de las siguientes palabras es una marca conocida
			for (let i = 1; i < words.length; i++) {
				const word = words[i].toLowerCase();
				// Ignorar números (como "12" en "whisky glenfiddich 12")
				if (/^\d+$/.test(word)) continue;

				for (const brand of NO_TRANSLATE_BRANDS) {
					if (word === brand || word.includes(brand) || brand.includes(word)) {
						return true;
					}
				}
			}
			// Si alguna palabra después del tipo de destilado empieza con mayúscula, probablemente es una marca
			for (let i = 1; i < words.length; i++) {
				if (/^\d+$/.test(words[i])) continue; // Ignorar números
				if (words[i][0] === words[i][0].toUpperCase() && words.length <= 4) {
					return true;
				}
			}
		}
	}

	// Para textos más largos (descripciones), permitir traducción
	// Solo bloquear si es claramente un nombre de producto (2-4 palabras con patrón marca)
	return false;
}

class TranslationService {
	constructor() {
		this.cache = this.loadCache();
		// Limpiar traducciones antiguas con cantidades no deseadas al inicializar
		this.cleanQuantityCache();
		// Cola de traducciones para evitar rate limiting
		this.translationQueue = [];
		this.isProcessing = false;
		this.lastRequestTime = 0;
		this.MIN_DELAY_BETWEEN_REQUESTS = 200; // 200ms entre solicitudes
	}

	/**
	 * Carga el caché desde localStorage
	 */
	loadCache() {
		try {
			const cached = localStorage.getItem(CACHE_KEY);
			return cached ? JSON.parse(cached) : {};
		} catch (error) {
			console.error("Error loading translation cache:", error);
			return {};
		}
	}

	/**
	 * Guarda el caché en localStorage
	 */
	saveCache() {
		try {
			localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
		} catch (error) {
			console.error("Error saving translation cache:", error);
		}
	}

	/**
	 * Genera una clave única para el caché
	 * Incluye preserveQuantities para separar traducciones con/sin cantidades
	 */
	getCacheKey(text, fromLang, toLang, preserveQuantities = true) {
		return `${fromLang}_${toLang}_${preserveQuantities ? "q" : "nq"}_${text
			.toLowerCase()
			.trim()}`;
	}

	/**
	 * Extrae cantidades (números y unidades) de un texto de ingrediente
	 * Ejemplo: "45 ml pineapple shrub" -> { quantity: "45 ml", text: "pineapple shrub" }
	 */
	extractQuantity(text) {
		// Patrón para detectar cantidades: número opcional + espacio + unidad (ml, oz, g, kg, etc.)
		const quantityPattern =
			/^(\d+(?:\.\d+)?\s*(?:ml|oz|g|kg|cl|lt|l|gramos?|mililitros?|onzas?|litros?|centilitros?)\s*)/i;
		const match = text.match(quantityPattern);

		if (match) {
			return {
				quantity: match[1].trim(),
				text: text.substring(match[0].length).trim(),
			};
		}

		return { quantity: null, text };
	}

	/**
	 * Traduce un texto usando la API de MyMemory
	 * @param {string} text - Texto a traducir
	 * @param {string} fromLang - Idioma origen (ej: 'es')
	 * @param {string} toLang - Idioma destino (ej: 'en')
	 * @param {boolean} preserveQuantities - Si es true, preserva cantidades al inicio del texto
	 * @returns {Promise<string>} - Texto traducido
	 */
	async translate(
		text,
		fromLang = "es",
		toLang = "en",
		preserveQuantities = true
	) {
		if (!text || text.trim() === "") {
			return text;
		}

		// Si el idioma es el mismo, retornar el texto original
		if (fromLang === toLang) {
			return text;
		}

		// Verificar si contiene marcas o nombres propios que no deben traducirse
		if (shouldNotTranslate(text)) {
			console.log("🚫 Not translating (brand/proper noun):", text);
			return text;
		}

		// Extraer cantidad si existe (para ingredientes)
		let quantity = null;
		let textToTranslate = text;

		if (preserveQuantities) {
			const extracted = this.extractQuantity(text);
			if (extracted.quantity) {
				quantity = extracted.quantity;
				textToTranslate = extracted.text;

				// Si no queda texto después de extraer la cantidad, retornar original
				if (!textToTranslate.trim()) {
					return text;
				}
			}
		}

		const cacheKey = this.getCacheKey(
			textToTranslate,
			fromLang,
			toLang,
			preserveQuantities
		);

		// Verificar si ya está en caché
		if (this.cache[cacheKey]) {
			console.log(
				"📦 Translation from cache:",
				textToTranslate.substring(0, 50)
			);
			const cachedTranslation = this.cache[cacheKey];
			return quantity ? `${quantity} ${cachedTranslation}` : cachedTranslation;
		}

		try {
			// Rate limiting: esperar un mínimo de tiempo entre solicitudes
			const timeSinceLastRequest = Date.now() - this.lastRequestTime;
			if (timeSinceLastRequest < this.MIN_DELAY_BETWEEN_REQUESTS) {
				await new Promise((resolve) =>
					setTimeout(
						resolve,
						this.MIN_DELAY_BETWEEN_REQUESTS - timeSinceLastRequest
					)
				);
			}

			console.log("🌐 Translating via API:", textToTranslate.substring(0, 50));

			const url = `${API_URL}?q=${encodeURIComponent(
				textToTranslate
			)}&langpair=${fromLang}|${toLang}`;
			this.lastRequestTime = Date.now();
			const response = await fetch(url);

			// Manejar error 429 (Too Many Requests) - retry con delay más largo
			if (response.status === 429) {
				console.warn(
					"⚠️ API rate limit reached (429), retrying after delay..."
				);
				// Esperar más tiempo antes de retry
				await new Promise((resolve) => setTimeout(resolve, 2000));

				// Retry una vez
				this.lastRequestTime = Date.now();
				const retryResponse = await fetch(url);

				if (retryResponse.status === 429) {
					console.warn(
						"⚠️ API still rate limited, using original text:",
						textToTranslate
					);
					return text;
				}

				if (!retryResponse.ok) {
					throw new Error(`Translation API error: ${retryResponse.status}`);
				}

				const retryData = await retryResponse.json();
				if (retryData.responseStatus === 200 && retryData.responseData) {
					let translatedText = retryData.responseData.translatedText;
					if (!preserveQuantities) {
						const quantityPattern =
							/^\d+(?:\.\d+)?\s*(?:ml|oz|g|kg|cl|lt|l|gramos?|mililitros?|onzas?|litros?|centilitros?)\s*/i;
						translatedText = translatedText.replace(quantityPattern, "").trim();
					}
					this.cache[cacheKey] = translatedText;
					this.saveCache();
					return quantity ? `${quantity} ${translatedText}` : translatedText;
				}
				return text;
			}

			if (!response.ok) {
				throw new Error(`Translation API error: ${response.status}`);
			}

			const data = await response.json();

			if (data.responseStatus === 200 && data.responseData) {
				let translatedText = data.responseData.translatedText;

				// Si preserveQuantities es false, eliminar cualquier cantidad que la API haya agregado
				if (!preserveQuantities) {
					const quantityPattern =
						/^\d+(?:\.\d+)?\s*(?:ml|oz|g|kg|cl|lt|l|gramos?|mililitros?|onzas?|litros?|centilitros?)\s*/i;
					translatedText = translatedText.replace(quantityPattern, "").trim();
				}

				// Guardar en caché (sin la cantidad)
				this.cache[cacheKey] = translatedText;
				this.saveCache();

				// Retornar con cantidad preservada si existía
				return quantity ? `${quantity} ${translatedText}` : translatedText;
			} else {
				console.warn("Translation API returned error, using original text");
				return text;
			}
		} catch (error) {
			console.error("Error translating text:", error);
			// En caso de error, retornar el texto original
			return text;
		}
	}

	/**
	 * Traduce un array de textos
	 * @param {string[]} texts - Array de textos a traducir
	 * @param {string} fromLang - Idioma origen
	 * @param {string} toLang - Idioma destino
	 * @returns {Promise<string[]>} - Array de textos traducidos
	 */
	async translateBatch(texts, fromLang = "es", toLang = "en") {
		const promises = texts.map((text) =>
			this.translate(text, fromLang, toLang)
		);
		return Promise.all(promises);
	}

	/**
	 * Limpia el caché de traducciones
	 */
	clearCache() {
		this.cache = {};
		localStorage.removeItem(CACHE_KEY);
		console.log("🗑️ Translation cache cleared");
	}

	/**
	 * Limpia traducciones antiguas que tienen cantidades cuando no deberían
	 * Esto corrige el problema de traducciones en caché con cantidades fantasma
	 */
	cleanQuantityCache() {
		const keysToRemove = [];
		const quantityPattern =
			/^\d+(?:\.\d+)?\s*(?:ml|oz|g|kg|cl|lt|l|gramos?|mililitros?|onzas?|litros?|centilitros?)\s*/i;

		for (const key of Object.keys(this.cache)) {
			const translation = this.cache[key];
			// Si la traducción empieza con una cantidad, podría ser una traducción antigua incorrecta
			if (
				typeof translation === "string" &&
				quantityPattern.test(translation)
			) {
				// Verificar si es una clave antigua (sin el flag de preserveQuantities)
				if (!key.includes("_q_") && !key.includes("_nq_")) {
					keysToRemove.push(key);
				}
			}
		}

		// Eliminar claves problemáticas
		keysToRemove.forEach((key) => {
			delete this.cache[key];
		});

		if (keysToRemove.length > 0) {
			this.saveCache();
			console.log(
				`🧹 Cleaned ${keysToRemove.length} cached translations with unwanted quantities`
			);
		}
	}

	/**
	 * Obtiene estadísticas del caché
	 */
	getCacheStats() {
		const keys = Object.keys(this.cache);
		return {
			totalTranslations: keys.length,
			cacheSize: JSON.stringify(this.cache).length,
			languages: [
				...new Set(keys.map((k) => k.split("_")[0] + "-" + k.split("_")[1])),
			],
		};
	}
}

// Exportar instancia única (singleton)
const translationService = new TranslationService();
export default translationService;
