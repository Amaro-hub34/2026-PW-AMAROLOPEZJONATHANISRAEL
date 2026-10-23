const express = require('express');
const app = express();

app.use(express.json());

const PORT = 4000;

// Importar controladores
const talleresControlador = require('./Controlador/talleres_controlador');
const asistenciaControlador = require('./Controlador/asistencia_controlador');
const usuarioControlador = require('./Controlador/usuario_controlador');

// Rutas de prueba iniciales
app.get('/saludo', (req, res) => {
    res.json({mensaje: 'Hola esto es una prueba en GET'});
});

app.post('/eco', (req, res) => {
    const {texto} = req.body;
    if(!texto) {
        return res.status(400).json({error: 'El texto es obligatorio'});
    }
    res.status(201).json({eco: texto});
});

// Paso 3
app.get('/api/talleres', talleresControlador.listarTalleres);
app.get('/api/talleres/:id', talleresControlador.obtenerTaller);
app.post('/api/talleres', talleresControlador.crearTaller);

// Paso 4
app.post('/api/asistencias', asistenciaControlador.registrarAsistencia);
app.get('/api/asistencias/:id', asistenciaControlador.obtenerAsistencia);
app.get('/api/talleres/:id/asistencias', asistenciaControlador.consultarAsistenciaPorTaller);

// Paso 5
app.get('/api/usuarios', usuarioControlador.listarUsuarios);
app.get('/api/usuarios/:id', usuarioControlador.obtenerUsuario);
app.post('/api/usuarios', usuarioControlador.crearUsuario);
app.put('/api/usuarios/:id', usuarioControlador.actualizarUsuario); 
app.delete('/api/usuarios/:id', usuarioControlador.eliminarUsuario); 

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto: ${PORT}`);
});