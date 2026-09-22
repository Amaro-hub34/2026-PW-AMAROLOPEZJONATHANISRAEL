const talleres = [
  { nombre: 'Introducción a Python', instructor: 'Ing. María López', cupo: 25, inscritos: 25 },
  { nombre: 'Fundamentos de Redes', instructor: 'Ing. Carlos Ramírez', cupo: 30, inscritos: 18 },
  { nombre: 'Diseño de Bases de Datos', instructor: 'Ing. Ana Torres', cupo: 20, inscritos: 20 },
  { nombre: 'Desarrollo Web con JS', instructor: 'Ing. María López', cupo: 25, inscritos: 10 },
];


function pintarTabla(){
    //debe de obtener la tabla y rellenarla con los datos de talleres
    const tabla = document.getElementById('tabla-talleres');
    const tbody = tabla.querySelector('tbody');
    tbody.innerHTML = '';

    talleres.forEach((taller) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${taller.nombre}</td>
            <td>${taller.instructor}</td>
            <td>${taller.cupo}</td>
            <td>${taller.inscritos}</td>
        `;
        tbody.appendChild(fila);
    });

}



const formArreglos = document.getElementById('form-arreglos');
const resultadoArreglos = document.getElementById('resultado-arreglo');
const selectOperacionArreglo = document.getElementById('operacion-arreglo');

formArreglos.addEventListener('submit', (evento) =>{
    evento.preventDefault();
    const operacion = selectOperacionArreglo.value;

    let resultado;
    //Lógica para cada operación de arreglo, o sea el switch para que se pueda ejecutar y mostrar el resultado en el div
    

    switch(operacion){
        case 'forEach':
            resultado = talleres.map((t) => `- ${t.nombre} (${t.inscritos}/${t.cupo})`).join('\n');
            break;

        case 'map':
            resultado = talleres.map((t) => t.nombre).join(', ');
            break;

        case 'filter':
            resultado = talleres.filter((t) => t.inscritos >= t.cupo).map((t) => t.nombre).join(', ');
            break;

        case 'find':
            const tallerEncontrado = talleres.find((t) => t.instructor === 'Ing. María López');
            resultado = tallerEncontrado ? `${tallerEncontrado.nombre} (${tallerEncontrado.inscritos}/${tallerEncontrado.cupo})` : 'No se encontró ningún taller';
            break;
            
    }



    resultadoArreglos.textContent = resultado;
});
pintarTabla();