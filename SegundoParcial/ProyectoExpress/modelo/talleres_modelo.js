const pool = require('../bd-local');

async function listar() {
    const [filas] = await pool.query('SELECT * FROM talleres ORDER BY fecha');
    return filas;
}

async function obtenerPorId(id) {
    const [filas] = await pool.query('SELECT * FROM talleres WHERE id = ?', [id]);
    return filas[0];
}

async function crear({ nombre, instructor, fecha, cupo }) {
    const [info] = await pool.query(
        'INSERT INTO talleres (id, nombre, instructor, fecha, cupo) VALUES (UUID(), ?, ?, ?, ?)',
        [nombre, instructor, fecha, cupo || 30]
    );
    

    return {
        mensaje: "Taller creado correctamente",
        datos: { nombre, instructor, fecha, cupo: cupo || 30 }
    };
}

module.exports = {
    listar,
    obtenerPorId,
    crear
};