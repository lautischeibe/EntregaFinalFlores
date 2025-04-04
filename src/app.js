const express = require("express");
const { engine } = require("express-handlebars"); // Motor de plantillas Handlebars
const path = require("path"); // Manejo de rutas
const http = require("http"); // Servidor HTTP
const { Server } = require("socket.io"); // Websockets

const productRoutes = require("./routes/productRoutes"); // Rutas de productos
const cartRoutes = require("./routes/cartRoutes"); // Rutas de carritos
const ProductManager = require("./managers/ProductManager"); // Lógica de productos

const app = express(); // Inicializamos Express

// Configuración de Handlebars como motor de plantillas
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Middleware para manejar JSON y archivos estáticos
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Conectar las rutas existentes
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);

// Instancia de ProductManager para manejar productos
const productManager = new ProductManager("./data/products.json");

// Inicializar servidor HTTP para websockets
const PORT = 8080;
const server = http.createServer(app);
const io = new Server(server);

// Configurar Websockets
io.on("connection", (socket) => {
  console.log("Cliente conectado");

  // Enviar lista inicial de productos al cliente conectado
  socket.emit("updateProducts", productManager.getProducts());

  // Crear un producto desde la vista en tiempo real
  socket.on("newProduct", async (product) => {
    await productManager.addProduct(product);
    const products = await productManager.getProducts();
    io.emit("updateProducts", products);
  });

  // Eliminar un producto desde la vista en tiempo real
  socket.on("deleteProduct", async (productId) => {
    await productManager.deleteProduct(productId);
    const products = await productManager.getProducts();
    io.emit("updateProducts", products);
  });
});

// Rutas para vistas
app.get("/", async (req, res) => {
  const products = await productManager.getProducts();
  res.render("home", {
    products,
  });
});

app.get("/realtimeproducts", async (req, res) => {
  res.render("realTimeProducts");
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

module.exports = app;
