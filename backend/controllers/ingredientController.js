import ingredientService from '../services/ingredient/index.js';

const createIngredient = async (req, res) => {
  try {
    const { name } = req.body;
    const newIngredient = await ingredientService.cretaeIngredientService(name);
    res.status(201).json({
      message: 'Ingrediente creado exitosamente',
      ingredient: newIngredient,
    });
  } catch (error) {
    console.error('Error al crear el ingrediente:', error);
    res.status(500).json({
      message: 'Error al crear el ingrediente',
      error: error.message,
    });
  }
};

const deleteIngredient = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedIngredient =
      await ingredientService.deleteIngredientService(id);
    res.status(200).json({
      message: 'Ingrediente eliminado exitosamente',
      ingredient: deletedIngredient,
    });
  } catch (error) {
    console.error('Error al eliminar el ingrediente:', error);
    res.status(500).json({
      message: 'Error al eliminar el ingrediente',
      error: error.message,
    });
  }
};

const getAllIngredients = async (req, res) => {
  try {
    const ingredients = await ingredientService.getAllIngredientsService();
    res.status(200).json({
      message: 'Ingredientes obtenidos exitosamente',
      ingredients,
    });
  } catch (error) {
    console.error('Error al obtener los ingredientes:', error);
    res.status(500).json({
      message: 'Error al obtener los ingredientes',
      error: error.message,
    });
  }
};

const getIngredientById = async (req, res) => {
  const { id } = req.params;
  try {
    const ingredient = await ingredientService.getIngredientByIdService(id);
    if (!ingredient) {
      return res.status(404).json({
        message: 'Ingrediente no encontrado',
      });
    }
    res.status(200).json({
      message: 'Ingrediente obtenido exitosamente',
      ingredient,
    });
  } catch (error) {
    console.error('Error al obtener el ingrediente:', error);
    res.status(500).json({
      message: 'Error al obtener el ingrediente',
      error: error.message,
    });
  }
};

const updateIngredient = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const updatedIngredient = await ingredientService.updateIngredientService(
      id,
      name,
    );
    res.status(200).json({
      message: 'Ingrediente actualizado exitosamente',
      ingredient: updatedIngredient,
    });
  } catch (error) {
    console.error('Error al actualizar el ingrediente:', error);
    res.status(500).json({
      message: 'Error al actualizar el ingrediente',
      error: error.message,
    });
  }
};

const searchIngredient = async (req, res) => {
  const { searchTerm } = req.query;

  if (!searchTerm || searchTerm.trim().length === 0) {
    return res.status(400).json({
      message: 'Término de búsqueda requerido',
      error: 'Debe proporcionar un término de búsqueda',
    });
  }

  try {
    const ingredients = await ingredientService.searchIngredientService(
      searchTerm.trim(),
    );
    res.status(200).json({
      message: 'Ingredientes encontrados exitosamente',
      ingredients,
    });
  } catch (error) {
    console.error('Error al buscar el ingrediente:', error);
    res.status(500).json({
      message: 'Error al buscar el ingrediente',
      error: error.message,
    });
  }
};

export default {
  createIngredient,
  deleteIngredient,
  getAllIngredients,
  getIngredientById,
  updateIngredient,
  searchIngredient,
};
