const express = require('express');
const ProductManager = require('../managers/ProductManager'); // Importa el ProductManager
const router = express.Router();

const productManager = new ProductManager('./data/products.json'); // Inicializa la instancia con la ruta del archivo JSON

// Ruta para obtener todos los productos
router.get('/', async (req, res) => {
  const { limit = 10, page = 1, sort, query } = req.query;

  let products = await productManager.getProducts();

  // Filtrar por categoría
  if (query) {
    products = products.filter(product => product.category === query);
  }

  // Ordenar por precio
  if (sort === 'asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'desc') {
    products.sort((a, b) => b.price - a.price);
  }

  // Paginación
  const totalPages = Math.ceil(products.length / limit);
  const startIndex = (page - 1) * limit;
  const paginatedProducts = products.slice(startIndex, startIndex + Number(limit));

  res.json({
    status: 'success',
    payload: paginatedProducts,
    totalPages,
    page: Number(page),
    hasPrevPage: page > 1,
    hasNextPage: page < totalPages,
    prevPage: page > 1 ? Number(page) - 1 : null,
    nextPage: page < totalPages ? Number(page) + 1 : null,
  });
});


// Ruta para obtener un producto por ID
router.get('/:pid', async (req, res) => {
  const productId = Number(req.params.pid); // Captura el ID desde la URL
  const product = await productManager.getProductById(productId); // Obtiene el producto por ID

  if (!product) {
    return res.status(404).json({ message: 'Producto no encontrado' }); // Error si el producto no existe
  }

  res.json(product); // Devuelve el producto encontrado
});


router.get('/categories', async (req, res) => {
  const products = await productManager.getProducts();
  const categories = [...new Set(products.map(product => product.category))]; // Filtra categorías únicas
  res.json(categories);
});


router.post('/', async (req, res) => {
  const { title, description, code, price, stock, category, status } = req.body;

  // Validaciones
  if (!title || !description || !code || !price || !stock || !category || status === undefined) {
    return res.status(400).json({ message: 'Faltan propiedades requeridas' });
  }

  const products = await productManager.getProducts();
  const codeExists = products.some(product => product.code === code);
  if (codeExists) {
    return res.status(400).json({ message: 'El código ya existe' });
  }

  const newProduct = await productManager.addProduct(req.body);
  res.status(201).json(newProduct);
});


router.put('/:pid', async (req, res) => {
  const productId = Number(req.params.pid);
  const updatedFields = req.body;

  const product = await productManager.getProductById(productId);
  if (!product) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }

  // Validar que no se actualice el código a uno ya existente
  if (updatedFields.code) {
    const products = await productManager.getProducts();
    const codeExists = products.some(p => p.code === updatedFields.code && p.id !== productId);
    if (codeExists) {
      return res.status(400).json({ message: 'El código ya existe' });
    }
  }

  const updatedProduct = await productManager.updateProduct(productId, updatedFields);
  res.json(updatedProduct);
});


// Ruta para eliminar un producto por ID
router.delete('/:pid', async (req, res) => {
  const deleted = await productManager.deleteProduct(Number(req.params.pid)); // Elimina el producto por ID

  if (!deleted) {
    return res.status(404).json({ message: 'Producto no encontrado' }); // Error si el producto no existe
  }

  res.json({ message: 'Producto eliminado' }); // Confirma que el producto fue eliminado
});

module.exports = router;
