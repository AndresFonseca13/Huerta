// Controller de Productos con nomenclatura clara
import productServices from '../services/product/index.js';

const getAllProducts = async (req, res) => {
  const pagina = parseInt(req.query.page || req.query.pagina, 10) || 1;
  const limite = parseInt(req.query.limit || req.query.limite, 10) || 10;
  const offset = (pagina - 1) * limite;

  const categoria = req.query.categoria || null;
  const tipo = req.query.tipo || null;
  const orden = req.query.orden || 'name';

  try {
    const result = await productServices.getAllProductsService({
      categoria,
      tipo,
      orden,
      limite,
      offset,
    });

    res.status(200).json({
      pagina,
      limite,
      cantidad: result.cocktails.length,
      cocteles: result.cocktails,
      paginacion: result.pagination,
    });
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).json({ mensaje: 'Error al obtener los productos' });
  }
};

const getAllProductsAdmin = async (req, res) => {
  const pagina = parseInt(req.query.page || req.query.pagina, 10) || 1;
  const limite = parseInt(req.query.limit || req.query.limite, 10) || 10;
  const offset = (pagina - 1) * limite;

  const categoria = req.query.categoria || null;
  const tipo = req.query.tipo || null;
  const orden = req.query.orden || 'name';

  try {
    const result = await productServices.getAllProductsAdminService({
      categoria,
      tipo,
      orden,
      limite,
      offset,
    });

    res.status(200).json({
      pagina,
      limite,
      cantidad: result.cocktails.length,
      cocteles: result.cocktails,
      paginacion: result.pagination,
    });
  } catch (error) {
    console.error('Error al obtener los productos para admin:', error);
    res.status(500).json({ mensaje: 'Error al obtener los productos' });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  const uuidRegex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!id || !uuidRegex.test(id)) {
    return res.status(400).json({
      mensaje: 'ID inválido',
      error: 'El ID debe ser un UUID válido',
      idRecibido: id,
    });
  }

  try {
    const product = await productServices.getProductByIdService(id);
    if (!product)
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.status(200).json(product);
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).json({ mensaje: 'Error al obtener el producto' });
  }
};

const createProduct = async (req, res) => {
  const { name, price, description, ingredients, images, categories } =
		req.body;
  const alcoholPercentage =
		typeof req.body.alcohol_percentage !== 'undefined'
		  ? req.body.alcohol_percentage
		  : req.body.alcoholPercentage ?? null;
  const user = req.user.id;

  try {
    const product = await productServices.createProductService(
      name,
      price,
      description,
      ingredients,
      images,
      categories,
      user,
      alcoholPercentage,
    );
    res.status(201).json({ mensaje: 'Producto creado exitosamente', product });
  } catch (error) {
    console.error('Error al crear el producto:', error);
    res.status(500).json({ mensaje: 'Error interno al crear el producto' });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await productServices.updateProductService(id, req.body);
    res.status(200).json({ mensaje: 'Producto actualizado', product: updated });
  } catch (error) {
    if (error.message === 'Cóctel no encontrado.') {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    console.error('Error al actualizar el producto:', error);
    res
      .status(500)
      .json({ mensaje: 'Error interno al actualizar el producto' });
  }
};

const updateProductStatus = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  try {
    const updated = await productServices.updateProductStatusService(
      id,
      isActive,
    );
    res.status(200).json({ mensaje: 'Estado actualizado', product: updated });
  } catch (error) {
    console.error('Error al actualizar estado del producto:', error);
    res.status(500).json({ mensaje: 'Error interno' });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await productServices.deleteProductService(id);
    if (!deleted)
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.status(200).json({ mensaje: 'Producto eliminado' });
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({ mensaje: 'Error interno' });
  }
};

const searchProducts = async (req, res) => {
  const { searchTerm } = req.query;
  if (!searchTerm || searchTerm.trim().length === 0) {
    return res.status(400).json({ mensaje: 'Término de búsqueda requerido' });
  }
  try {
    const products = await productServices.searchProductsService(
      searchTerm.trim(),
    );
    res
      .status(200)
      .json({ mensaje: 'Ok', productos: products, total: products.length });
  } catch (error) {
    console.error('Error en búsqueda de productos:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

const getFoodProducts = async (req, res) => {
  try {
    const pagina = parseInt(req.query.page || req.query.pagina, 10) || 1;
    const limite = parseInt(req.query.limit || req.query.limite, 10) || 10;
    const offset = (pagina - 1) * limite;
    const categoria = req.query.categoria || null;
    const orden = req.query.orden || 'name';

    const result = await productServices.getFoodProductsService({
      categoria,
      limite,
      offset,
      orden,
    });

    res.status(200).json({
      pagina,
      limite,
      cantidad: result.cocktails.length,
      cocteles: result.cocktails,
      paginacion: result.pagination,
    });
  } catch (error) {
    console.error('Error al obtener la comida:', error);
    res.status(500).json({ mensaje: 'Error al obtener la comida' });
  }
};

export default {
  getAllProducts,
  getAllProductsAdmin,
  getProductById,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
  searchProducts,
  getFoodProducts,
};
