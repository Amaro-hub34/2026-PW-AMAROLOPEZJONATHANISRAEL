const bcrypt = require('bcryptjs');

function crearModeloUsuarios(pool) {
  // Regresa el usuario (sin el hash) si la contraseña es correcta, o null si no.
  async function verificar(usuario, contrasena) {
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE usuario = ?',
      [usuario]
    );

    if (rows.length === 0) {
      return null;
    }

    const user = rows[0];

    const hashAlmacenado = user.contrasena_hash || user.contrasena || user.contraseña || user.password;

    if (!hashAlmacenado) {
      console.error("No se encontró la columna de contraseña en el objeto:", user);
      return null;
    }

    const passwordMatch = await bcrypt.compare(contrasena, hashAlmacenado);

    if (passwordMatch) {
      delete user.contrasena_hash;
      delete user.contrasena;
      delete user.contraseña;
      delete user.password;
      return user;
    }

    return null;
  }

  return { verificar };
}

module.exports = { crearModeloUsuarios };