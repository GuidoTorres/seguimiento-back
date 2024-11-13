const multer = require("multer");
const path = require('node:path');
const fs = require('fs/promises');  // Cambiamos a fs normal
const fsSync = require('fs');  // Para operaciones síncronas

const multerConfig = {
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Crear carpeta temporal si no existe
      const tempDir = path.join(__dirname, '..', 'uploads', 'temp');
      
      // Verificar si el directorio existe de manera síncrona
      if (!fsSync.existsSync(tempDir)) {
        fsSync.mkdirSync(tempDir, { recursive: true });
      }
      
      cb(null, tempDir);
    },
    filename: (req, file, cb) => {
      // Generar nombre único para el archivo
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const ext = path.extname(file.originalname);
      const filename = `cotizacion_${uniqueSuffix}${ext}`;
      cb(null, filename);
    }
  }),
  limits: {
    fileSize: 52428800, // 50MB en bytes
    files: 1, // Limitar a un solo archivo
    fieldSize: 50 * 1024 * 1024 // Tamaño máximo del campo del formulario
  },
  fileFilter: (req, file, cb) => {
    // Validar tipo de archivo
    if (!file.originalname.match(/\.(pdf)$/)) {
      return cb(new Error('Solo se permiten archivos PDF'), false);
    }

    // Verificar mime type
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('El archivo debe ser un PDF válido'), false);
    }

    // Si pasa las validaciones
    cb(null, true);
  }
};

// Middleware para manejar errores de Multer
const uploadMiddleware = (req, res, next) => {
  const upload = multer(multerConfig).single('pdf');

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Error de Multer
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          msg: 'El archivo excede el límite de 50MB'
        });
      }
      return res.status(400).json({
        success: false,
        msg: 'Error al subir el archivo',
        error: err.message
      });
    } else if (err) {
      // Error personalizado de fileFilter
      return res.status(400).json({
        success: false,
        msg: err.message
      });
    }
    
    // Si no hay archivo
    if (!req.file) {
      return res.status(400).json({
        success: false,
        msg: 'Por favor seleccione un archivo PDF'
      });
    }

    // Todo OK
    next();
  });
};

// Función para limpiar archivos temporales (opcional)
const cleanupTempFiles = async (filePath) => {
  try {
    if (filePath && fsSync.existsSync(filePath)) {
      await fs.unlink(filePath);
      console.log('Archivo temporal eliminado:', filePath);
    }
  } catch (error) {
    console.error('Error al limpiar archivo temporal:', error);
  }
};

module.exports = { 
  uploadMiddleware,
  cleanupTempFiles 
};