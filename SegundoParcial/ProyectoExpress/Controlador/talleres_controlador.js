//Aquí se hará el controlador de talleres, con sus funciones correspondientes para
//  registrar y consultar talleres.
const talleresModel = require('../modelo/talleres_modelo');

async function listarTalleres(req, res) {
    try {
        const talleres = await talleresModel.listar();
        res.json(talleres);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
async function obtenerTaller(req, res) {
    try {
        const taller = await talleresModel.obtenerPorId(req.params.id);
        if (!taller) return res.status(404).json({ error: 'Taller no encontrado' });
        res.json(taller);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
async function crearTaller(req, res) {
    try {
        const { nombre, instructor, fecha, cupo } = req.body;
        const resultado = await talleresModel.crear({ nombre, instructor, fecha, cupo });
        res.status(201).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
module.exports = {
    listarTalleres,
    obtenerTaller,
    crearTaller
};
