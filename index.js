const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const multer = require('multer');


const server = "http://localhost:3000"

// Configura el servidor para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'uploads')));

// Configura Multer para manejar la subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Obtiene el ID del usuario de la solicitud
    const userId = req.body.userId;
    // Si el ID del usuario es undefined o está vacío, devuelve un error
    if (userId === undefined || userId === '') {
      cb('Error: ID del usuario no especificado');
      return;
    }
    // Construye la ruta de la carpeta del usuario
    const userFolder = `uploads/${userId}/images`;
    // Crea la carpeta del usuario si no existe
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }
    // Establece la carpeta de destino como la carpeta del usuario
    cb(null, userFolder);
  },
  filename: function (req, file, cb) {
    // Establece el nombre del archivo como el nombre original del archivo
    cb(null, file.originalname);
  }
});

// Inicializa Multer con la configuración de almacenamiento
const upload = multer({ storage: storage });

// Crea una ruta POST para recibir imágenes
app.post('/upload-image', upload.single('image'), (req, res) => {
  // Envía una respuesta de éxito
  res.send('Imagen subida con éxito');
});

// Crea una ruta personalizada para devolver el arreglo de enlaces de las imágenes
app.get('/image-links/:userId', function (req, res) {
  const userId = req.params.userId;
  // Lee el contenido de la carpeta de imágenes
  fs.readdir(path.join(__dirname, `/uploads/${userId}/images`), function (err, files) {
    if (err) {
      // Si hay un error al leer la carpeta, devuelve un mensaje de error
      res.send('Error al leer la carpeta de imágenes');
      return;
    }

    // Crea el arreglo de enlaces de las imágenes
    const imageLinks = files.map(file => `${server}/uploads/${userId}/images/${file}`);

    // Devuelve el arreglo de enlaces de las imágenes en formato JSON
    res.json({ imageLinks });
  });
});

// Crea una ruta personalizada para servir imágenes
app.get('/uploads/:userId/images/:image', function (req, res) {
  // Obtiene el ID del usuario y el nombre de la imagen de los parámetros de la ruta
  const userId = req.params.userId;
  const imageName = req.params.image;
  // Construye la ruta completa del archivo de imagen
  const filePath = path.join(__dirname, 'uploads', userId, 'images', imageName);
  // Envía el archivo al navegador
  res.sendFile(filePath);
});

// Crea una ruta personalizada para servir el archivo 'index.html'
app.get('/', function (req, res) {
  // Construye la ruta completa del archivo 'index.html'
  const filePath = path.join(__dirname, 'public', 'index.html');
  // Envía el archivo al navegador
  res.sendFile(filePath);
});

app.delete('/delete-image/:userId/:imageName', (req, res) => {
  // Obtiene el nombre de la imagen y el ID del usuario de los parámetros de la ruta
  const imageName = req.params.imageName;
  const userId = req.params.userId;
  // Construye la ruta completa del archivo de imagen
  const filePath = path.join(__dirname, `/uploads/${userId}/images`, imageName);
  // Verifica si el archivo existe
  if (fs.existsSync(filePath)) {
    // Elimina el archivo
    fs.unlinkSync(filePath);
    // Envía una respuesta de éxito
    res.send('Imagen eliminada con éxito');
  } else {
    // Envía una respuesta de error
    res.send('Error: La imagen no existe');
  }
});
// Inicia el servidor
app.listen(3000, function () {
  console.log('Servidor iniciado en el puerto 3000');
});