const getAllCocktailsService = require("./getAllCocktailsService");
const getAllCocktailsAdminService = require("./getAllCocktailsAdminService");
const getCocktailByIdService = require("./getCocktailByIdService");
const createCocktailService = require("./createCocktailService");
const updateCocktailService = require("./updateCocktailService");
const updateCocktailStatusService = require("./updateCocktailStatusService");
const deleteCocktailService = require("./deleteCocktailService");
const searchProductsService = require("./searchProductsService");

module.exports = {
	getAllCocktailsService,
	getAllCocktailsAdminService,
	getCocktailByIdService,
	createCocktailService,
	updateCocktailService,
	updateCocktailStatusService,
	deleteCocktailService,
	searchProductsService,
};
