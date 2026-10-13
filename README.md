# Gestor de participantes

Proyecto de práctica con HTML, CSS, JavaScript, Node.js y Express.

## Instalación

Abre una terminal en esta carpeta y ejecuta:

```bash
npm install
npm start
```

Abre http://localhost:3000

## Archivos

- `app.js`: servidor Express y rutas de la API.
- `logic.js`: búsqueda, validación y funciones de participantes.
- `cookies.js`: validación de la preferencia de tema.
- `index.html`: página principal.
- `panel.html` y `panel.js`: panel para revisar la sesión.
- `ayuda.html` y `ayuda.js`: página de ayuda.
- `estilos.css`: estilos.

## Contenidos de las sesiones

- Peticiones HTTP y rutas Express.
- Parámetros de ruta, query y body.
- Arrays de objetos, `find()` y `filter()`.
- Normalización y validación.
- Respuestas JSON y códigos 400, 404 y 201.
- Formularios y `fetch()`.
- Cookies y sesiones.
- Contador de visitas y cesta en sesión.
- Preferencia de tema en cookie.

## Justificación

El tema se guarda en una cookie porque es una preferencia pequeña y no sensible. El servidor valida que sea `claro` u `oscuro`.

El contador se guarda en `req.session.visitas`, porque representa el estado de una sesión concreta.

La cesta se guarda en `req.session.cesta`. Solo contiene identificadores y cantidades; los datos del participante se consultan en el servidor.

## maxAge

La cookie del tema dura 30 días. Para probar la caducidad, cambia temporalmente `maxAge` a `10 * 1000` y espera diez segundos.

## Network

En las herramientas de desarrollador se puede revisar `Set-Cookie` cuando el servidor crea una cookie y `Cookie` en peticiones posteriores.

## API y equivalencias HTML

Con el servidor iniciado en `http://localhost:3000`, estas son las rutas disponibles y su correspondencia con la interfaz:

| Funcionalidad | Petición | Equivalente HTML |
| --- | --- | --- |
| Listar participantes | `GET /api/participantes` | Inicio: carga la lista al abrir la página. |
| Buscar participantes | `GET /api/participantes?texto=carlos` | Inicio: campo de búsqueda y botón **Buscar**. Busca por nombre, apellidos, correo o tipo. |
| Consultar por ID | `GET /api/participantes/1` | Inicio: formulario **Consultar por ID**. |
| Dar de alta | `POST /api/participantes` | Inicio: formulario **Nuevo participante**. |
| Consultar visitas | `GET /api/visitas` | Inicio: contador de visitas. |
| Leer tema | `GET /api/tema` | Inicio: carga y muestra el tema actual. |
| Guardar tema | `POST /api/tema` | Inicio: botones **Claro** y **Oscuro**. |
| Consultar cesta | `GET /api/cesta` | Inicio: sección **Cesta de participantes**. |
| Añadir a la cesta | `POST /api/cesta/:id` | Inicio: botón **Añadir a la cesta** en cada participante. |
| Vaciar cesta | `DELETE /api/cesta` | Inicio: botón **Vaciar cesta**. |
| Consultar estado de sesión | `GET /api/sesion` | Panel: estado inicial y botón **Actualizar estado**. |

### Ejemplos con curl

Listar, buscar y consultar un participante existente:

```bash
curl -i http://localhost:3000/api/participantes
curl -i "http://localhost:3000/api/participantes?texto=carlos"
curl -i http://localhost:3000/api/participantes/1
```

Dar de alta un participante. La respuesta correcta es `201 Created`:

```bash
curl -i -X POST http://localhost:3000/api/participantes \
	-H "Content-Type: application/json" \
	-d '{"nombre":"Pedro","apellidos":"Lopez Ruiz","email":"pedro@example.com","tipo":"Alumno"}'
```

El servidor valida los campos; un ejemplo inválido devuelve `400 Bad Request` y un objeto `errores`:

```bash
curl -i -X POST http://localhost:3000/api/participantes \
	-H "Content-Type: application/json" \
	-d '{"nombre":"P","apellidos":"","email":"sin-correo","tipo":"Otro"}'
```

Las rutas de sesión deben compartir el mismo archivo de cookies en todas las llamadas. La segunda consulta de visitas debe incrementar el contador de la primera:

```bash
curl -i -c cookies.txt -b cookies.txt http://localhost:3000/api/visitas
curl -i -c cookies.txt -b cookies.txt http://localhost:3000/api/visitas
```

El tema usa una cookie independiente llamada `tema`. Guardar un tema válido responde `303 See Other` y devuelve `Set-Cookie`; conserva el archivo para poder consultarlo:

```bash
curl -i -c cookies.txt -b cookies.txt -X POST http://localhost:3000/api/tema \
	-H "Content-Type: application/json" \
	-d '{"tema":"oscuro"}'
curl -i -c cookies.txt -b cookies.txt http://localhost:3000/api/tema
```

La cesta también depende de la sesión. Usa el mismo cookie jar para consultar, añadir y vaciar:

```bash
curl -i -c cookies.txt -b cookies.txt http://localhost:3000/api/cesta
curl -i -c cookies.txt -b cookies.txt -X POST http://localhost:3000/api/cesta/1
curl -i -c cookies.txt -b cookies.txt http://localhost:3000/api/cesta
curl -i -c cookies.txt -b cookies.txt -X DELETE http://localhost:3000/api/cesta
```

Para consultar juntas las visitas y la cesta de esa sesión:

```bash
curl -i -c cookies.txt -b cookies.txt http://localhost:3000/api/sesion
```

`cookies.txt` es un archivo local de prueba. No borres ni cambies el archivo entre llamadas que deban pertenecer a la misma sesión.

### Errores esperados

| Caso | HTTP | Respuesta |
| --- | --- | --- |
| ID no entero en `GET /api/participantes/:id` | `400` | `{"error":"ID no válido"}` |
| ID entero sin participante en `GET /api/participantes/:id` | `404` | `{"error":"Participante no encontrado"}` |
| Campos inválidos al dar de alta | `400` | `{"errores":{...},"valores":{...}}` con el detalle por campo. |
| Tema distinto de `claro` u `oscuro` | `400` | `{"error":"Tema no válido"}` |
| ID no entero o menor que 1 al añadir a la cesta | `400` | `{"error":"ID no válido"}` |
| Participante inexistente al añadir a la cesta | `404` | `{"error":"Participante no encontrado"}` |

Ejemplos para comprobar los errores de ID y tema:

```bash
curl -i http://localhost:3000/api/participantes/abc
curl -i http://localhost:3000/api/participantes/999
curl -i -X POST http://localhost:3000/api/cesta/abc
curl -i -X POST http://localhost:3000/api/cesta/999
curl -i -X POST http://localhost:3000/api/tema \
	-H "Content-Type: application/json" \
	-d '{"tema":"azul"}'
```

En Windows PowerShell, usa `curl.exe` y pasa el JSON por la entrada estándar para evitar problemas al escapar comillas:

```powershell
$json = '{"nombre":"Pedro","apellidos":"Lopez Ruiz","email":"pedro@example.com","tipo":"Alumno"}'
$json | curl.exe -i -X POST http://localhost:3000/api/participantes `
	-H 'Content-Type: application/json' --data-binary '@-'
```

## Reinicio y MemoryStore

El contador y la cesta se pierden al reiniciar el servidor porque MemoryStore guarda las sesiones en la memoria del proceso. La cookie del tema permanece en el navegador.

MemoryStore solo es adecuado para esta práctica local. En producción se necesita un almacén externo compartido.

