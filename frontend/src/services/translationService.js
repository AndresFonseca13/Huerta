/**
 * Servicio de traducción con caché en localStorage
 * Utiliza MyMemory Translation API (gratuita)
 */

const CACHE_KEY = "huerta_translations_cache";
const API_URL = "https://api.mymemory.translated.net/get";

class TranslationService {
	constructor() {
		this.cache = this.loadCache();
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
	 */
	getCacheKey(text, fromLang, toLang) {
		return `${fromLang}_${toLang}_${text.toLowerCase().trim()}`;
	}

	/**
	 * Traduce un texto usando la API de MyMemory
	 * @param {string} text - Texto a traducir
	 * @param {string} fromLang - Idioma origen (ej: 'es')
	 * @param {string} toLang - Idioma destino (ej: 'en')
	 * @returns {Promise<string>} - Texto traducido
	 */
	async translate(text, fromLang = "es", toLang = "en") {
		if (!text || text.trim() === "") {
			return text;
		}

		// Si el idioma es el mismo, retornar el texto original
		if (fromLang === toLang) {
			return text;
		}

		const cacheKey = this.getCacheKey(text, fromLang, toLang);

		// Verificar si ya está en caché
		if (this.cache[cacheKey]) {
			console.log("📦 Translation from cache:", text.substring(0, 50));
			return this.cache[cacheKey];
		}

		try {
			console.log("🌐 Translating via API:", text.substring(0, 50));

			const url = `${API_URL}?q=${encodeURIComponent(
				text
			)}&langpair=${fromLang}|${toLang}`;
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error("Translation API error");
			}

			const data = await response.json();

			if (data.responseStatus === 200 && data.responseData) {
				const translatedText = data.responseData.translatedText;

				// Guardar en caché
				this.cache[cacheKey] = translatedText;
				this.saveCache();

				return translatedText;
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
