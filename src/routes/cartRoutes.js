const express = require('express');
const CartManager = require('../managers/CartManager');
const router = express.Router();
const fs = require('fs');


const cartManager = new CartManager('./data/carts.json');

// Crea un carrito
router.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.createCart(); // Crear un nuevo carrito
    res.status(201).json(newCart); // Responder con el carrito creado
  } catch (error) {
    console.error('Error creando el carrito:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});


// Obtiene productos del carrito por ID
router.get('/:cid', async (req, res) => {
  try {
    const cid = Number(req.params.cid);
    if (isNaN(cid)) {
      return res.status(400).json({ message: 'ID de carrito inválido' });
    }

    const cart = await cartManager.getCartById(cid);
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    res.json(cart.products);
  } catch (error) {
    console.error('Error obteniendo productos del carrito:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Agrega un producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cid = Number(req.params.cid); // ID del carrito
    const pid = Number(req.params.pid); // ID del Pokémon
    const quantity = req.body.quantity || 1; // Cantidad (por defecto 1)

    if (isNaN(cid) || isNaN(pid) || quantity <= 0) {
      return res.status(400).json({ message: 'Datos inválidos: El ID de carrito, ID de Pokémon y cantidad deben ser válidos.' });
    }

    const updatedCart = await cartManager.addProductToCart(cid, pid, quantity);
    if (!updatedCart) {
      return res.status(404).json({ message: 'Carrito no encontrado.' });
    }

    res.json({ message: 'Pokémon agregado al carrito', updatedCart });
  } catch (error) {
    console.error('Error al agregar el Pokémon al carrito:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});





// Renderiza la vista del carrito
router.get('/:cid/view', async (req, res) => {
  try {
    const cid = Number(req.params.cid);
    if (isNaN(cid)) {
      return res.status(400).send('ID de carrito inválido.');
    }

    const cart = await cartManager.getCartById(cid);
    if (!cart) {
      return res.status(404).send('Carrito no encontrado.');
    }

    res.render('cart', { cart });
  } catch (error) {
    console.error('Error renderizando la vista del carrito:', error);
    res.status(500).send('Error interno del servidor.');
  }
});

router.delete('/:cid/product/:pid', async (req, res) => {
  try {
    const cid = Number(req.params.cid);
    const pid = Number(req.params.pid);

    console.log('Recibido en DELETE:', { cid, pid }); // Log para confirmar los parámetros

    if (isNaN(cid) || isNaN(pid)) {
      return res.status(400).json({ message: 'Datos inválidos: ID de carrito o producto incorrectos.' });
    }

    const carts = await cartManager.getCarts(); // Leer todos los carritos
    const cart = carts.find(cart => cart.id === cid); // Buscar el carrito con el ID especificado

    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    // Filtrar los productos para eliminar el producto especificado
    const originalProductsCount = cart.products.length;
    cart.products = cart.products.filter(p => p.productId !== pid);

    // Verificar si realmente se eliminó algo
    if (cart.products.length === originalProductsCount) {
      return res.status(404).json({ message: 'Producto no encontrado en el carrito.' });
    }

    // Actualizar el archivo JSON con los nuevos datos del carrito
    const updatedCarts = carts.map(c => (c.id === cid ? cart : c)); // Actualizar el carrito modificado
    await fs.promises.writeFile(cartManager.path, JSON.stringify(updatedCarts, null, 2));

    res.json({ message: 'Producto eliminado del carrito', cart });
  } catch (error) {
    console.error('Error eliminando producto del carrito:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
