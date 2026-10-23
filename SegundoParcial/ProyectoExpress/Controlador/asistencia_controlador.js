const asistenciaModel = require('../modelo/asistencia_modelo');

async function registrarAsistencia(req, res) {
    try {
        const { taller_id, tallerId, nombre_alumno, nombreAlumno, boleta } = req.body;
        
        const idTaller = taller_id || tallerId;
        const alumno = nombre_alumno || nombreAlumno;

        if (!idTaller || !alumno || !boleta) {
            return res.status(400).json({ 
                error: "taller_id, nombre_alumno y boleta son obligatorios" 
            });
        }

        const resultado = await asistenciaModel.registrarAsistencia({ 
            tallerId: idTaller, 
            nombreAlumno: alumno, 
            boleta 
        });
        res.status(201).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function obtenerAsistencia(req, res) {
    try {
        const asistencia = await asistenciaModel.obtenerPorId(req.params.id);
        if (!asistencia) return res.status(404).json({ error: 'Asistencia no encontrada' });
        res.json(asistencia);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function consultarAsistenciaPorTaller(req, res) {
    try {
        const { id } = req.params; // ID del taller
        const asistencias = await asistenciaModel.consultarAsistenciaPorTaller(id);
        res.json(asistencias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    registrarAsistencia,
    obtenerAsistencia,
    consultarAsistenciaPorTaller
};