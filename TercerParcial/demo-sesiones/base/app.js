// La aplicación de la demo. server.js la arranca; las pruebas la arrancan con otras configuraciones.
// Lo que dice "(en clase)" lo programamos juntos, paso por paso. Mientras no esté, esa ruta responde 501.
const path = require('path');
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { crearModeloUsuarios } = require('./modelos/usuarios.modelo');

const NOMBRE_COOKIE = 'connect.sid';

//Si hay una sesión preexistente obteneral del almacen si no crearlas
function todasLasSesiones(almacen){
  return new Promise((resolve, reject) => {
    const promesa = almacen.all((error, sesiones) => (error ? reject(error) : resolve(sesiones)));
    if (promesa && typeof promesa.then === 'function') promesa.then(resolve, reject);
  });
}

function crearApp(config, pool){
  const app = express();
  app.use(express.json());
  //primero debemos de obtener el modelo de la bd
  const usuarios = crearModeloUsuarios(pool);

  //aquí nosotros debemos de identificar la sesión será por tabla en bd, o la sesión será una cookie en memoria del navegador
  //o es una mezcla, sesion en memoria de servidor y por tabla en bd y cookie en navegador y bd
  const almacen = config.almacen === 'memoria' ? new session.MemoryStore() : new MySQLStore({createDatabaseTable: false, clearExpired: false}, pool);
  app.locals.almacen = almacen;

  app.use(session({
    name: NOMBRE_COOKIE,
    secret: process.env.SESSION_SECRET || 'secreto-solo-para-la-demo',
    store: almacen,
    resave: false,
    //NO se crea la sesión ni la cookie
    saveUninitialized: false,
    rolling : config.rolling || false,
    cookie : {
      maxAge: config.maxAge || 1000 * 60 * 60 * 24, //1 día
      httpOnly : config.httpOnly || true,
      sameSite : config.sameSite || 'lax',
      secure : config.secure || false,
    },

    })
  );

  //necesitamos visualizar el id de la sesión para compararla en la pantalla

  const idCorto = (id) => (id ? `${id.slice(0,8)}...`: null);

  //nosotros estamos ocupados en middleware, el cual es el que se encarga de comunicer el back y el front, para ello debemos de obtener la sesión a partir de express
  //pero en cada petición debemos de devolver la sesión, para ello el atributo rolling, la extiende y aunque le hayamos dado false, no se puede confiar en que la expiere
  //para ello debemos de identificarla y validarla en sus diferentes momentos
  function vencida(sesion){
    const desde = config.rolling ? sesion.ultimoUso : sesion.creada;
    return Date.now() - desde > config.maxAge;
  }

  //mandar un 401 no se quien eres
  function requiereSesion(req, res, next){
    if (req.session.usuario && vencida(req.session)){
      return req.session.destroy(() =>{
        res.clearCookie(NOMBRE_COOKIE);
        res.status(401).json({error: '401 Tu sesión ya expiró, vuelve a iniciar sesión'});
      })
    }
    if (!req.session.usuario){
      return res.status(401).json({error: '401 No has iniciado sesión con la cuenta correcta'});
    }
    req.session.ultimoUso = Date.now();
    next();
  }

  function requiereRol(rol){
    return (req, res, next) => {
      if (req.session.usuario.rol !== rol){
        return res.status(403).json({error: `Eres ${req.session.usuario.rol}, pero esta ruta es para ${rol}`});
      }
      next();
    };
  }

  //vamos a definir las rutas de acceso

  app.get('/api/config', (req, res) => {
    res.json(config);
  });

  //vamos a crear una ruta para un usuario visitante, sin que inicie sesión

  app.post('/api/visita', (req, res) => {
    if(!req.session) return res.json({error: 'no tiene acceso'});
    req.session.visitas = (req.session.visitas || 0) + 1;
    res.json({visitas: req.session.visitas, sesion: idCorto(req.sessionID)});
  });

  //vamos a autenticarnos
  app.post('/api/login', async (req, res, next) => {
    try{
      const {usuario, contrasena} = req.body || {};
      const datos = await usuarios.verificar(usuario, contrasena);
      if (!datos) return res.status(401).json({error: 'Usuario o contraseña incorrectos'});

      const antes = req.session.visitas !== undefined ? idCorto(req.sessionID) : null;
      const visitas = req.session.visitas || 0;

      //tenemos que guardar los datos de la sesión
      const guardar = () =>{
        req.session.usuario = datos;
        req.session.visitas = visitas;
        req.session.creada = Date.now();
        req.session.ultimoUso = Date.now();
        req.session.save((error) => {
          if (error) return next(error);
          res.json({usuario:datos, sesionAntes: antes, sesionDespues: idCorto(req.sessionID)});
        });
      };


      if (config.regenerarAlEntrar){
          req.session.regenerate((error)=> (error ? next(error) : guardar()));

      } else {
        guardar();
      }
    } catch (error){
      next(error);
    }


  });

  app.post('/api/logout', (req, res, next) => {
    req.session.destroy((error) => {
      if (error) return next(error);
      res.clearCookie(NOMBRE_COOKIE);
      res.json({mensaje: 'Sesión cerrada'});
    });
  });

  app.get('/api/sesion', requiereSesion, (req, res) => {
    const desde = config.rolling ? req.session.ultimoUso : req.session.creada;
    res.json({
      usuario: req.session.usuario,
      sesion: idCorto(req.sessionID),
      expiraEnSegundos : Math.max(0, Math.round((desde + config.maxAge - Date.now()) / 1000)),
    });
  });

  app.get('/api/perfil', requiereSesion, (req, res) => {
      req.session.visitas = (req.session.visitas || 0) + 1;
      res.json({
        mensaje: `Hola ${req.session.usuario.nombre} rol:  ${req.session.usuario.rol}, visitas: ${req.session.visitas}`,
      });
  });

  //vamos a desarollar una prueba uitadria para verificar con v o fl las pruebas ejectuadas
  app.get('/api/diagnostico/sesiones', async (req, res, next) => {
    try {
      const sesiones = await todasLasSesiones(almacen);
      const lista = Object.entries(sesiones || {}).map(([id, s]) => ({
        sesion: idCorto(id),
        esLaTuya: id === req.sessionID,
        usuario: s.usuario ? s.usuario.usuario : 'Sin iniciar sesion',
        visitas: s.visitas || 0,
        expira: s.cookie && s.cookie.expires,
      }));
      res.json({almacen : config.almacen, sesiones: lista});
    } catch (error){
      next(error);
    }
  });


  app.use(express.static(path.join(__dirname, 'public')));

  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({error: 'Error del servidor'});
  });

  app.use('/api', (req, res) => res.status(404).json({error: 'Ruta no encontrada'}));

  return app;
}


module.exports = {crearApp, NOMBRE_COOKIE};

//tarea 1, deberán de realizar una infografia sobre la autentificación con el uso de jwt y como se implementa para el domingo

// tarea 2 con el uso del archivo que se les va a proveer deberan de completar y realizar las pruebas al ejercicio de sesiones en el archivo llamado demo.js
//para implementarse en el archivo demo.js, se evaluará la siguiente clase.