const router = require("express").Router();
const usuario = require("../controllers/usuarios");

router.get("/ejecutora", usuario.getUsuarioEjecutora)
router.get("/costo", usuario.getUsuarioCosto)
router.get("/", usuario.getUsers)
module.exports = router