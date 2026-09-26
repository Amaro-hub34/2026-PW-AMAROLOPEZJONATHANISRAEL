
const patrones = {
    nombre: /^[A-Za-zÁÉÍÓÚÑáéíóúñÜü\s]{2,60}$/,
    mensaje: /^[\s\S]{10,500}$/
};

const mensajes = {
    nombre: "Solo letras y espacios, entre 2 y 60 caracteres.",
    mensaje: "El mensaje debe tener entre 10 y 500 caracteres."
};

function validarCampo(campo, valor){
    return patrones[campo].test(valor.trim());
}

if (typeof document !== 'undefined') {
    const formulario = document.getElementById('form-registro');

    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault(); 

        let formularioValido = true;

        for(const campo of Object.keys(patrones)){
            const input = document.getElementById(campo);
            const errorSpan = document.getElementById(`error-${campo}`);
            const esValido = validarCampo(campo, input.value);
            
            input.classList.toggle('invalido', !esValido);
            
            errorSpan.textContent = esValido ? '' : mensajes[campo]; 
            
            if(!esValido) {
                formularioValido = false;
            }
        }

        const mensajeExito = document.getElementById('mensaje-exito');
        mensajeExito.textContent = formularioValido ? '¡Mensaje enviado con éxito!' : '';
    });
}