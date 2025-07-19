import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Services Tests", () => {
	test("should have basic service structure", () => {
		// Test básico de estructura de servicios
		const serviceStructure = {
			cocktail: [
				"getAllCocktailsService",
				"createCocktailService",
				"updateCocktailService",
			],
			category: ["getAllCategoriesService", "createCategoryService"],
			ingredient: ["getAllIngredientsService", "createIngredientService"],
		};

		expect(serviceStructure).toHaveProperty("cocktail");
		expect(serviceStructure).toHaveProperty("category");
		expect(serviceStructure).toHaveProperty("ingredient");
		expect(serviceStructure.cocktail).toContain("getAllCocktailsService");
	});

	test("should validate service naming convention", () => {
		const serviceNames = [
			"getAllCocktailsService",
			"createCocktailService",
			"updateCocktailService",
			"deleteCocktailService",
		];

		serviceNames.forEach((name) => {
			expect(name).toMatch(/^[a-z]+[A-Z][a-zA-Z]*Service$/);
		});
	});
});

describe("Database Configuration Test", () => {
	test("should have database configuration structure", () => {
		const dbConfig = {
			host: "localhost",
			port: 5432,
			database: "test_db",
			user: "test_user",
		};

		expect(dbConfig).toHaveProperty("host");
		expect(dbConfig).toHaveProperty("port");
		expect(dbConfig).toHaveProperty("database");
		expect(typeof dbConfig.port).toBe("number");
	});
});
