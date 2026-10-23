// Todas las peticiones al backend pasan por aquí, para no repetir en cada página el mismo manejo de errores.
// La ruta es relativa (/api/...): next.config.js la reenvía al backend del puerto 3001.
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const BACKEND_CAIDO = 'El backend no responde: arráncalo con npm start en backend-memoria (puerto 3001).';

export async function pedirJSON(ruta, opciones = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}/api${ruta}`, {
      ...opciones,
      headers: { 'Content-Type': 'application/json', ...opciones.headers },
    });
  } catch {
    throw new Error(BACKEND_CAIDO);
  }

  let datos = null;
  try {
    datos = await res.json();
  } catch {
    datos = null;
  }

  if (!res.ok) {
    if (datos && datos.error) throw new Error(datos.error);
    throw new Error(res.status === 500 ? BACKEND_CAIDO : `El backend respondió ${res.status}`);
  }
  return datos;
}