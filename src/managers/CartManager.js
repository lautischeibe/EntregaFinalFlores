const fs = require('fs');

class CartManager {
  constructor(filePath) {
    this.path = filePath;
  }
  
  async createCart() {
    const carts = await this.getCarts(); // Leer todos los carritos existentes
    const maxId = carts.length > 0 ? Math.max(...carts.map(cart => cart.id)) : 0; // Buscar el ID más alto
    const newCart = { id: maxId + 1, products: [] }; // Crear un carrito con ID incremental
    carts.push(newCart); // Agregar el nuevo carrito
  
    try {
      await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2)); // Guardar los cambios
      console.log(`Nuevo carrito creado con ID: ${newCart.id}`); // Log para confirmar el ID
    } catch (error) {
      console.error('Error al guardar el carrito en el archivo:', error);
      throw new Error('No se pudo guardar el carrito.');
    }
  
    return newCart; // Devolver el carrito recién creado
  }


  async getCarts() {
    try {
      const data = await fs.promises.readFile(this.path, 'utf-8');
      return JSON.parse(data); // Leer y parsear el archivo JSON
    } catch (error) {
      if (error.code === 'ENOENT') { // Si el archivo no existe
        console.warn('El archivo carts.json no existe. Creando uno nuevo...');
        await fs.promises.writeFile(this.path, JSON.stringify([], null, 2)); // Crear archivo vacío
        return [];
      }
      console.error('Error al leer los carritos:', error);
      return [];
    }
  }
  
  

  async getCartById(id) {
    const carts = await this.getCarts();
    return carts.find(cart => cart.id === id);
  }
  

  async addProductToCart(cid, pid, quantity = 1) {
    const carts = await this.getCarts(); // Leer todos los carritos existentes
    const cart = carts.find(cart => cart.id === cid); // Buscar el carrito por ID
    if (!cart) {
      console.error(`Carrito con ID ${cid} no encontrado.`);
      return null; // Si no se encuentra el carrito, devolver null
    }
  
    console.log('Carrito encontrado:', cart); // Log de depuración
  
    // Buscar el producto dentro del carrito
    const product = cart.products.find(p => p.productId === pid);
    if (product) {
      product.quantity += quantity; // Si el producto ya existe, actualizar la cantidad
      console.log(`Producto actualizado: ${JSON.stringify(product)}`); // Log de depuración
    } else {
      const newProduct = { productId: pid, quantity };
      cart.products.push(newProduct); // Si no existe, agregar un nuevo producto
      console.log(`Producto agregado: ${JSON.stringify(newProduct)}`); // Log de depuración
    }
  
    try {
      await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2)); // Guardar los cambios en el archivo
      console.log('Carrito actualizado después de agregar producto:', cart); // Log de depuración
    } catch (error) {
      console.error('Error al actualizar el archivo de carritos:', error);
      throw new Error('No se pudo actualizar el carrito.');
    }
  
    return cart; // Devolver el carrito actualizado
  }

}

module.exports = CartManager;