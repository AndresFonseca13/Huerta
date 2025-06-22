const createCocktailService = require("./createCocktailService");
const getAllCocktailsService = require("./getAllCocktailsService");
const getCocktailByIdService = require("./getCocktailByIdService");
const deleteCocktailService = require("./deleteCocktailService");
const searchProductsService = require("./searchProductsService");
const updateCocktailService = require("./updateCocktailService");
const updateCocktailStatusService = require("./updateCocktailStatusService");

module.exports = {
	createCocktailService,
	getAllCocktailsService,
	getCocktailByIdService,
	deleteCocktailService,
	searchProductsService,
	updateCocktailService,
	updateCocktailStatusService,
};
