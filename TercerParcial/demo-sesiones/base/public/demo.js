// La página solo hace fetch a la API. El navegador manda la cookie solo (misma página, mismo servidor).
const $ = (id) => document.getElementById(id);

/*
* token guarda el JWT que regresa /api/jwt/login.
* Se guarda en una variable y no en localStorage para que otro script de la página
* no lo pueda leer tan fácil; por eso se pierde al recargar la página.
* A diferencia de la cookie, el servidor no guarda nada: el token solo existe aquí.
*/
let token = null;

/*
* La función llamar hace un fetch a la API y regresa un objeto con el estado
* y los datos (si los hay).
* El cuerpo se manda como JSON y el Content-Type solo cuando hay cuerpo,
* porque express.json() lo necesita para saber que debe leerlo como JSON.
* La cookie la manda el navegador solo, pero el token no: si conToken es true
* se agrega el encabezado Authorization: Bearer <token>, que es donde lo busca requiereJWT.
* Se usa ...opciones.headers para no borrar el Content-Type cuando también hay cuerpo.
*/

async function llamar(metodo, url, cuerpo, conToken){
    const opciones = {method: metodo};
    if (cuerpo) {
        opciones.body = JSON.stringify(cuerpo);
        opciones.headers = {'Content-Type': 'application/json'};
    }
    if (conToken && token) {
        opciones.headers = { ...opciones.headers, Authorization: `Bearer ${token}`};
    }
    
    const respuesta = await fetch(url, opciones);

    let datos = null;
    try {
        datos = await respuesta.json();
    } catch (error) {
        console.warn("Error al parsear la respuesta JSON:", error);
    }

    return {status: respuesta.status, datos};

    
}
/*
* La función anotar agrega un elemento a la bitácora de la página 
* con el método, url, status y datos de la respuesta.
* Se usa porque es más fácil de leer que un console.log y se queda en la página.
* Se usa textContent para evitar que se ejecute código malicioso en la página.
* No se usa innerHTML porque interpreta el texto como HTML.
*
*/

function anotar(metodo, url, status, datos){
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = status;   
    li.appendChild(span);

    li.append(' ' +metodo + ' ' + url);

    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(datos, null, 2);
    li.appendChild(pre);

    span.className = 'codigo ' + claseDe(status);

    document.querySelector('#bitacora').prepend(li);
}

/*
*La función claseDe regresa una clase CSS según el código de estado HTTP.
* Se usa porque así se asignan los colores dependiendo del error
* Los 2xx se agrupan con un rango porque todos son éxito y van en verde;
* el 401 y el 403 se comparan exactos porque cada uno tiene su propio color.
*/

function claseDe(status){
    if (status >= 200 && status < 300) return 'ok';
    if (status === 401) return 'e401';
    if (status === 403) return 'e403'
    return 'error';
}

/*
* La función refrescarEstado hace un fetch a la API para obtener el estado de la sesión
*Se usa para actualizar la página con el estado de la sesión y la cookie.
* Se le pregunta al servidor si la sesión en lugar de que JS lo revise porque el servidor es el que
* tiene la información de la sesión y puede validar si está vencida o no.
* No se usa un setInterval porque se hace cada vez que se hace una acción en la página.
* 
*/ 

async function refrescarEstado(){
    const guardar = await llamar('GET', '/api/sesion');

    if (guardar.status === 200){
        $('estado').textContent = 'Hola: ' + guardar.datos.usuario.nombre + ' rol: ' + guardar.datos.usuario.rol + ' sesion: '  + guardar.datos.sesion + ' segundos: ' + guardar.datos.expiraEnSegundos;
        $('estado').className = 'estado con-sesion';
    } else {
        $('estado').textContent = 'Sin sesión (el servidor responde 401)';
        $('estado').className = 'estado sin-sesion';
    }

    $('cookie-js').textContent = document.cookie || '(vacío)';
}


/*
* La función refrescarJWT pinta la tarjeta 6: el estado, el token, el payload y la lista negra.
* Se le pregunta al servidor con /api/jwt/perfil en lugar de confiar solo en el payload,
* porque el payload no sabe si el token ya fue revocado (logout) ni si la firma sigue siendo válida;
* eso solo lo puede verificar el servidor con su secreto y la tabla tokens_revocados.
* Si el servidor responde error se muestra su mensaje (expirado, inválido o revocado).
* La lista negra se pide siempre, haya token o no, para ver lo que guarda el servidor.
*/
async function refrescarJWT(){
    if (!token) {
        $('estado-jwt').textContent = 'Sin token';
        $('estado-jwt').className = 'estado sin-sesion';
        $('jwt-token').textContent = '(sin token)';
        $('jwt-payload').textContent = '(vacío)';
    } else {
        $('jwt-token').textContent = token;
        $('jwt-payload').textContent = JSON.stringify(decodificar(token), null, 2);

        const perfil = await llamar('GET', '/api/jwt/perfil', null, true);
        if (perfil.status === 200) {
            $('estado-jwt').textContent = perfil.datos.mensaje + ' rol: ' + perfil.datos.rol + ' segundos: ' + perfil.datos.expiraEnSegundos;
            $('estado-jwt').className = 'estado con-sesion';
        } else {
            $('estado-jwt').textContent = perfil.datos.error;
            $('estado-jwt').className = 'estado sin-sesion';
        }
    }

    const lista = await llamar('GET', '/api/diagnostico/tokens');
    $('jwt-revocados').textContent = lista.datos.length === 0
        ? '(vacío)'
        : JSON.stringify(lista.datos, null, 2);
}

/*
* La función refrescarTabla le pide al servidor la lista de sesiones que tiene guardadas
* y la pinta en la tarjeta 4.
* Se vacía el tbody antes de llenarlo porque si no, cada vez que se actualiza
* se agregarían las mismas filas otra vez y se duplicarían.
* Se usa textContent en las celdas porque los datos vienen del servidor (XSS).
*/

async function refrescarTabla(){
    const tablaGuardar = await llamar('GET', '/api/diagnostico/sesiones');

    if (tablaGuardar.datos.almacen === 'mysql'){
        $('donde').textContent = 'En MySQL, tabla sessions';
    } else {
        $('donde').textContent = 'En memoria del servidor';
    }

    const tbody = $('tabla-sesiones');

    $('tabla-sesiones').textContent = '';

    if (tablaGuardar.datos.sesiones.length === 0){
        const tr = tbody.insertRow();
        const td = tr.insertCell();
        td.colSpan = 4;
        td.textContent = '(sin sesiones)';
        return;
    }

    for (const s of tablaGuardar.datos.sesiones){
        const tr = tbody.insertRow();
        const tdId = tr.insertCell();
        tdId.textContent = s.sesion;
        if (s.esLaTuya) {
            tdId.textContent += ' (la tuya)';
            tr.className = 'tuya';
        }
        const tdUsuario = tr.insertCell();
        tdUsuario.textContent = s.usuario || '(sin usuario)';
        const tdVisita = tr.insertCell();
        tdVisita.textContent = s.visitas;
        const tdVence = tr.insertCell();
        tdVence.textContent = new Date(s.expira).toLocaleTimeString();
    }
}

/*
* La función refrescarTodo junta refrescarEstado y refrescarTabla.
* Se usa porque después de cada acción (login, botones) hay que actualizar las dos cosas,
* y así no se repiten las dos llamadas en cada evento.
*/

async function refrescarTodo(){
    await refrescarEstado();
    await refrescarTabla();
}

/*
* La función decodificar saca el payload del JWT para mostrarlo en la página.
* Un JWT tiene tres partes separadas por punto: encabezado.payload.firma; el payload es la del medio.
* Se puede leer sin el secreto porque el token solo está firmado, no cifrado:
* la firma sirve para que nadie lo pueda modificar, no para ocultarlo.
* Los replace pasan de base64url (usa - y _) a base64 normal (usa + y /), porque atob solo entiende base64.
*/
function decodificar(t){
    const parteDelMedio = t.split('.')[1];
    const base64 = parteDelMedio.replace(/-/g, '+').replace(/_/g, '/');
    const texto = atob(base64);
    return JSON.parse(texto);
}



/*
* Eventos: conectan los botones y el formulario con las funciones.
* Se pasa el nombre de la función sin paréntesis porque el botón la debe ejecutar
* hasta que le den clic, no al cargar la página.
* En el formulario se usa preventDefault porque si no, el navegador recarga la página al enviarlo.
* Los botones con data-url se recorren con forEach para no escribir un addEventListener por cada uno;
* cada botón trae su método y su URL en dataset.
* No se anota la contraseña en la bitácora: solo se anota la respuesta del servidor.
*/

$('btn-refrescar').addEventListener('click', refrescarTodo);

$('btn-sesiones').addEventListener('click', refrescarTabla);

$('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const guardarLlamar = await llamar('POST', '/api/login', {
        usuario: $('usuario').value,
        contrasena: $('contrasena').value    
    });

   
    anotar('POST', '/api/login', guardarLlamar.status, guardarLlamar.datos);
    await refrescarTodo();  
});

// Se excluyen los botones data-jwt porque esos necesitan mandar el token y tienen su propio forEach abajo.
document.querySelectorAll('button[data-url]:not([data-jwt])').forEach((btn) => {
    btn.addEventListener('click', async () => {
        const url = btn.dataset.url;
        const metodo = btn.dataset.metodo;

        const guardarLlamar = await llamar(metodo, url);
        anotar(metodo, url, guardarLlamar.status, guardarLlamar.datos);
        await refrescarTodo();
    });
});

/*
* Login con JWT: usa el mismo usuario y contraseña de la tarjeta 2.
* Es un click y no un submit porque el botón está fuera del form, así que no hace falta preventDefault.
* Si el servidor responde 200 se guarda el token en la variable; la contraseña no se anota en la bitácora.
*/
$('btn-jwt-login').addEventListener('click', async () => {
    const r = await llamar('POST', '/api/jwt/login', {
        usuario: $('usuario').value,
        contrasena: $('contrasena').value
    });
    if (r.status === 200) {
        token = r.datos.token;
    }
    anotar('POST', '/api/jwt/login', r.status, r.datos);
    await refrescarJWT();
});

/*
* Botones de JWT (perfil, admin, refresh y logout): todos mandan el token, por eso el true.
* Solo refresh regresa un token nuevo, así que solo en esa ruta se reemplaza.
* En logout NO se borra el token a propósito: así se puede demostrar que, ya revocado,
* el mismo token recibe 401 Token revocado.
*/
document.querySelectorAll('button[data-jwt]').forEach((btn) => {
    btn.addEventListener('click', async () => {
        const url = btn.dataset.url;
        const metodo = btn.dataset.metodo;

        const r = await llamar(metodo, url, null, true);

        if (url === '/api/jwt/refresh' && r.status === 200) {
            token = r.datos.token;
        }
        anotar(metodo, url, r.status, r.datos);
        await refrescarJWT();
    });
});

$('usuario').addEventListener('change', () => {
    $('contrasena').value = $('usuario').value + '12345';
});

/*
* La función iniciar se ejecuta al cargar la página: muestra la configuración y refresca todo,
* incluida la tarjeta de JWT (que empieza en "Sin token" porque la variable se pierde al recargar).
* Se mete en una función async porque un await suelto fuera de una función rompe el archivo.
* No hace falta esperar a DOMContentLoaded porque el <script> está al final del <body>,
* así que cuando se ejecuta, todos los elementos de la página ya existen.
*/

async function iniciar(){
    const llamarConfig = await llamar('GET', '/api/config');
    $('config').textContent = JSON.stringify(llamarConfig.datos, null, 2);
    await refrescarTodo();
    await refrescarJWT();
}
iniciar();