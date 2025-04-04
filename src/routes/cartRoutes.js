const express = require('express');
const CartManager = require('../managers/CartManager');
const router = express.Router();

const cartManager = new CartManager('./data/carts.json');

//Crea un carrito
router.post('/', async (req, res) => {
  const cart = await cartManager.createCart();
  res.status(201).json(cart);
});

//Obtiene productos del carrito por ID
router.get('/:cid', async (req, res) => {
  const cart = await cartManager.getCartById(Number(req.params.cid));
  if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });
  res.json(cart.products);
});

router.post('/:cid/product/:pid', async (req, res) => {
  const cart = await cartManager.addProductToCart(Number(req.params.cid), Number(req.params.pid));
  if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });
  res.json(cart);
});

module.exports = router;