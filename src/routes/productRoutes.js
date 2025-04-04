const express = require('express');
const ProductManager = require('../managers/ProductManager'); // Importa el ProductManager
const router = express.Router();

const productManager = new ProductManager('./data/products.json'); // Inicializa la instancia con la ruta del archivo JSON

// Ruta para obtener todos los productos
router.get('/', async (req, res) => {
  const products = await productManager.getProducts();
  res.json(products); // Devuelve todos los productos
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

// Ruta para agregar un nuevo producto
router.post('/', async (req, res) => {
  const newProduct = req.body; // Captura el contenido enviado en el body
  const createdProduct = await productManager.addProduct(newProduct); // Crea el nuevo producto
  res.status(201).json(createdProduct); // Devuelve el producto creado con un estado 201
});

// Ruta para actualizar un producto por ID
router.put('/:pid', async (req, res) => {
  const productId = Number(req.params.pid); // Captura el ID desde la URL
  const updatedFields = req.body; // Captura los campos enviados en el body
  const updatedProduct = await productManager.updateProduct(productId, updatedFields); // Actualiza el producto

  if (!updatedProduct) {
    return res.status(404).json({ message: 'Producto no encontrado' }); // Error si el producto no existe
  }

  res.json(updatedProduct); // Devuelve el producto actualizado
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
