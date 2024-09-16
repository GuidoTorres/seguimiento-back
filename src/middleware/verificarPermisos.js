const jwt = require("jsonwebtoken");

const VerificarPermisos = (requiredPermissions) => {
    return (req, res, next) => {
      try {
        const token = req.cookies.tokenSession;
        if (!token) {
          return res.status(403).json({ msg: "No autorizado, token faltante" });
        }
  
        // Decodificar el token para obtener el rol y los permisos
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { permisos } = decoded; // Extraer los permisos
        
        // Verificar si los permisos del usuario incluyen los permisos requeridos
        const hasPermission = requiredPermissions.every((permiso) =>
          permisos.includes(permiso)
        );
        console.log(permisos);
        console.log(hasPermission);
  
        if (!hasPermission) {
          return res.status(403).json({ msg: "No tienes los permisos necesarios." });
        }
  
        // Si el usuario tiene los permisos, continuar con la ejecución
        next();
      } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Error de autorización." });
      }
    };
  };
  
  module.exports= VerificarPermisos

