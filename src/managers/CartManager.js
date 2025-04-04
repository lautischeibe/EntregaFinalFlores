const fs = require('fs');

class CartManager {
  constructor(filePath) {
    this.path = filePath;
  }

  async createCart() {
    const carts = await this.getCarts();
    const newCart = {
      id: carts.length ? carts[carts.length - 1].id + 1 : 1,
      products: []
    };
    carts.push(newCart);
    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
    return newCart;
  }

  async getCarts() {
    try {
      const data = await fs.promises.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async getCartById(id) {
    const carts = await this.getCarts();
    return carts.find(cart => cart.id === id);
  }

  async addProductToCart(cid, pid) {
    const carts = await this.getCarts();
    const cart = carts.find(cart => cart.id === cid);
    if (!cart) return null;

    const product = cart.products.find(p => p.product === pid);
    if (product) {
      product.quantity += 1;
    } else {
      cart.products.push({
        product: pid,
        quantity: 1
      });
    }

    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
    return cart;
  }
}

module.exports = CartManager;