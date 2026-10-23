//vamos a dejarles 2 de las 3 funciones para validar 

function validarCorreo(correo) { 
  if (typeof correo !== 'string') return false;
  return correo.includes('@') && correo.includes('.');
}

function validarBoleta(boleta) { 
  if (typeof boleta !== 'string') return false;
  return boleta.length === 8 && /^\d+$/.test(boleta);
}


function validarContrasena(){
 if(typeof contrasena !== 'string') return false;
 return contrasena.length >= 8;
}

module.exports = {validarCorreo, validarBoleta, validarContrasena};