const bcrypt = require('bcrypt');
const usuariosModel = require('../modelo/usuarios_modelo');

function esDuplicado(error){
    return error.code === 'ER_DUP_ENTRY' || error.code === '23505' || error.errno === 1062;
}

// Consultar a todos los usuarios
async function listarUsuarios(req, res){
    try{
        const usuarios = await usuariosModel.listar();
        res.json(usuarios);
    } catch(error){
        res.status(500).json({error: error.message});
    }
}

// Obtener un usuario por su ID
async function obtenerUsuario(req, res){
    try{
        const usuario = await usuariosModel.obtenerPorId(req.params.id);
        if(!usuario) return res.status(404).json({error: 'Usuario no encontrado'});
        res.json(usuario);
    } catch(error){
        res.status(500).json({error: error.message});
    }
}

// Registrar un nuevo usuario
async function crearUsuario(req, res) {
    try {
        const { nombre, correo, password, contrasena, boleta, rol } = req.body;
        const pass = password || contrasena;

        if (!nombre || !correo || !pass || !boleta) {
            return res.status(400).json({ error: "nombre, correo, contrasena y boleta son obligatorios" });
        }

        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexCorreo.test(correo)) {
            return res.status(400).json({ error: "El correo no tiene un formato válido" });
        }

        if (boleta.length !== 10) {
            return res.status(400).json({ error: "La boleta debe tener 10 dígitos" });
        }

        // 4. Validar longitud de la contraseña (al menos 8 caracteres)
        if (pass.length < 8) {
            return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
        }

        const contrasenaHash = await bcrypt.hash(pass, 10);

        const nuevoUsuario = await usuariosModel.crear({
            nombre,
            correo,
            contrasenaHash,
            boleta,
            rol: rol || 'alumno'
        });

        res.status(201).json({
            mensaje: "Usuario creado exitosamente",
            datos: nuevoUsuario
        });
    } catch (error) {
        if (esDuplicado(error)) {
            // La guía pide estrictamente 409 Conflict para duplicados
            return res.status(409).json({ error: "Ya existe un usuario con ese correo o boleta" });
        }
        res.status(500).json({ error: error.message });
    }
}

// Actualizar un usuario
async function actualizarUsuario(req, res) {
    try {
        const { nombre, correo, rol } = req.body;
        const idUsuarioActual = req.params.id;

        const nombreValido = nombre !== undefined && nombre.trim() !== '';
        const correoValido = correo !== undefined && correo.trim() !== '';
        const rolValido = rol !== undefined && rol.trim() !== '';

        if (!nombreValido && !correoValido && !rolValido) {
            return res.status(400).json({ error: "Envía al menos uno de: nombre, correo, rol" });
        }

        if (correoValido) {
            const usuarioExistente = await usuariosModel.obtenerPorCorreo(correo);
            
            if (usuarioExistente && String(usuarioExistente.id) !== String(idUsuarioActual)) {
                return res.status(409).json({ error: "El correo ya está registrado por otro usuario" });
            }
        }

        const usuarioActualizado = await usuariosModel.actualizar(idUsuarioActual, { nombre, correo, rol });

        if (!usuarioActualizado) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({
            mensaje: "Usuario actualizado exitosamente",
            datos: usuarioActualizado
        });
    } catch (error) {
        if (esDuplicado(error)) {
            return res.status(409).json({ error: "Ya existe un usuario con ese correo" });
        }
        res.status(500).json({ error: error.message });
    }
}

// Eliminar un usuario
async function eliminarUsuario(req, res) {
    try {
        const eliminado = await usuariosModel.eliminar(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    listarUsuarios,
    obtenerUsuario,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
};