const express = require('express');
const ProductManager = require('../managers/ProductManager');
const router = express.Router();

const productManager = new ProductManager('./data/products.json');

router.get('/', async (req, res) => {
  const products = await productManager.getProducts();
  res.json(products);
});

router.get('/:pid', async (req, res) => {
  const product = await productManager.getProductById(Number(req.params.pid));
  if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
  res.json(product);
});

router.post('/', async (req, res) => {
  const newProduct = req.body;
  const createdProduct = await productManager.addProduct(newProduct);
  res.status(201).json(createdProduct);
});

router.put('/:pid', async (req, res) => {
  const updatedProduct = await productManager.updateProduct(Number(req.params.pid), req.body);
  if (!updatedProduct) return res.status(404).json({ message: 'Producto no encontrado' });
  res.json(updatedProduct);
});

router.delete('/:pid', async (req, res) => {
  const deleted = await productManager.deleteProduct(Number(req.params.pid));
  if (!deleted) return res.status(404).json({ message: 'Producto no encontrado' });
  res.json({ message: 'Producto eliminado' });
});

module.exports = router;