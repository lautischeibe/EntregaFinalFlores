const fs = require('fs');

class ProductManager {
  constructor(filePath) {
    this.path = filePath; // Ruta del archivo JSON donde se almacenan los productos
  }

  // Obtener todos los productos
  async getProducts() {
    try {
      const data = await fs.promises.readFile(this.path, 'utf-8');
      return JSON.parse(data); // Devuelve los productos como un arreglo de objetos
    } catch (error) {
      return []; // Devuelve un arreglo vacío si el archivo no existe o hay un error
    }
  }

  // Obtener un producto por ID
  async getProductById(id) {
    const products = await this.getProducts(); // Obtiene todos los productos
    return products.find(product => product.id === id); // Busca el producto por ID
  }

  // Agregar un nuevo producto
  async addProduct(product) {
    const products = await this.getProducts(); // Obtiene todos los productos
    product.id = products.length ? products[products.length - 1].id + 1 : 1; // Genera un nuevo ID único
    products.push(product); // Agrega el nuevo producto al arreglo
    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2)); // Guarda los cambios en el archivo
    return product; // Devuelve el producto creado
  }

  // Actualizar un producto por ID
  async updateProduct(id, updatedFields) {
    const products = await this.getProducts(); // Obtiene todos los productos
    const productIndex = products.findIndex(product => product.id === id); // Encuentra el índice del producto

    if (productIndex === -1) {
      return null; // Si el producto no existe, devuelve null
    }

    // Actualiza solo los campos enviados en el body, manteniendo el ID intacto
    const existingProduct = products[productIndex];
    products[productIndex] = {
      ...existingProduct,
      ...updatedFields,
      id: existingProduct.id // Asegura que el ID no se modifica
    };

    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2)); // Guarda los cambios en el archivo
    return products[productIndex]; // Devuelve el producto actualizado
  }

  // Eliminar un producto por ID
  async deleteProduct(productId) {
    const products = await this.getProducts(); // Obtiene todos los productos
    const filteredProducts = products.filter(product => product.id !== productId); // Filtra los productos
    await fs.promises.writeFile(this.path, JSON.stringify(filteredProducts, null, 2)); // Guarda los cambios en el archivo
    return true; // Devuelve true si se eliminó correctamente
  }
}


module.exports = ProductManager;