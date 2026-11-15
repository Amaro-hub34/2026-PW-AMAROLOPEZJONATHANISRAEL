// La página solo hace fetch a la API. El navegador manda la cookie solo (misma página, mismo servidor).
const $ = (id) => document.getElementById(id);

/*
* La función llamar hace un fetch a la API y regresa un objeto con el estado
* y los datos (si los hay).
* El Content-Type se manda solo si hay un cuerpo, lo necesita express para parsearlo como JSON.
* y el cuerpo se manda como un JSON.
* No se usan credenciales porque la cookie se manda automáticamente por el navegador.
*/

async function llamar(metodo, url, cuerpo){
    const opciones = {method: metodo};
    if (cuerpo) {
        opciones.body = JSON.stringify(cuerpo);
        opciones.headers = {'Content-Type': 'application/json'};
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

function anotar(metodo, url, status, datos){
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = status;   
    li.appendChild(span);

    li.append(' ' +metodo + ' ' + url);

    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(datos, null, 2);
    li.appendChild(pre);

    span.className = 'codigo ok';

    document.querySelector('#bitacora').prepend(li);


}
