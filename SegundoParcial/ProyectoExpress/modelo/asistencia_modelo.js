const pool = require('../bd-local');

async function registrarAsistencia({ tallerId, nombreAlumno, boleta }) {
    const [info] = await pool.query(
        'INSERT INTO asistencias (id, taller_id, nombre_alumno, boleta) VALUES (UUID(), ?, ?, ?)',
        [tallerId, nombreAlumno, boleta]
    );
    
    return {
        mensaje: "Asistencia registrada correctamente",
        datos: { tallerId, nombreAlumno, boleta }
    };
}

async function obtenerPorId(id) {
    const [filas] = await pool.query('SELECT * FROM asistencias WHERE id = ?', [id]);
    return filas[0];
}

async function consultarAsistenciaPorTaller(tallerId) {
    const [filas] = await pool.query(
        `SELECT a.id, a.nombre_alumno, a.boleta, a.fecha_registro, t.nombre AS taller_nombre 
         FROM asistencias a 
         JOIN talleres t ON a.taller_id = t.id 
         WHERE a.taller_id = ?
         ORDER BY a.fecha_registro DESC`,
        [tallerId]
    );
    return filas;
}

module.exports = {
    registrarAsistencia,
    obtenerPorId,
    consultarAsistenciaPorTaller
};