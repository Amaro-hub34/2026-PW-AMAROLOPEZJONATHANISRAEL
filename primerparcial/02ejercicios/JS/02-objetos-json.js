// 02-objetos-json.js
// Object.keys/values/entries y JSON.stringify/parse. Completa cada TODO.
//A nivel lógica un objeto tiene llaves, y los arreglos corchetes
const taller = {
  nombre: 'Introducción a Python',
  instructor: 'Ing. María López',
  cupo: 25,
  inscritos: 25,
};

// TODO: Object.keys — imprime solo los nombres de las propiedades de `taller`,
//  keys obtiene los atributos de un objeto
console.log('Manejo de keys');
console.log(Object.keys(taller));

// TODO: Object.values — imprime solo los valores
console.log('Manejo de valores en un objeto');
console.log(Object.values(taller));

// TODO: Object.entries — recorre con for..of e imprime "campo: valor" de cada propiedad

console.log('Manejo de propiedades de un objeto');
for (const [campo, valor] of Object.entries(taller)) {
  console.log(`${campo}: ${valor}`);
}

// TODO: JSON.stringify — convierte `taller` a texto (guárdalo en `textoJson`) e imprímelo
//como transformar de un JSON a una cadena de texto
console.log('Transformación de JSON a cadena');
const textoJson = JSON.stringify(taller, null, 2);
console.log(textoJson);
console.log('tipo: ', typeof textoJson);

// TODO: JSON.parse — convierte `textoJson` de vuelta a objeto (guárdalo en `objetoDeVuelta`)
//       e imprime `objetoDeVuelta.nombre`
console.log('Transformando de JSON a objeto');
const objetoDeVuelta = JSON.parse(textoJson);
console.log('tipo: ', typeof objetoDeVuelta);
console.log(objetoDeVuelta.nombre);