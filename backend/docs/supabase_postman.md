# Supabase y Postman

## 1. Crear el modelo relacional en Supabase

1. Abre tu proyecto de Supabase.
2. Entra a `SQL Editor`.
3. Ejecuta el script de [modelo_relacional.sql](C:/Users/jeank/Documents/Claude%20Prueba/backend/supabase/modelo_relacional.sql).

Ese script deja listo:

- `usuarios`
- `ecuaciones`
- `partidas`

## 2. Ajustes importantes del modelo

Tu version inicial tenia dos incompatibilidades con el backend actual:

- `expresion` y `ecuacion_jugada` estaban en longitud `6`, pero una ecuacion como `1+2*3-4` mide `7`.
- `partidas` no guardaba el nombre del jugador; por eso agregue `usuarios` y el backend ahora guarda la partida enlazada al jugador.

## 3. Configurar variables del backend

Crea un archivo `.env` en `backend/` usando [`.env.example`](C:/Users/jeank/Documents/Claude%20Prueba/backend/.env.example).

Variables:

- `SUPABASE_URL`
- `SUPABASE_KEY`

Recomendacion:

- En el backend usa la `service_role key`.
- No expongas esa key al frontend de React.

## 4. Importar en Postman

Importa estos dos archivos:

- [ooodle_backend.postman_collection.json](C:/Users/jeank/Documents/Claude%20Prueba/backend/postman/ooodle_backend.postman_collection.json)
- [ooodle_backend.postman_environment.json](C:/Users/jeank/Documents/Claude%20Prueba/backend/postman/ooodle_backend.postman_environment.json)

## 5. Orden recomendado de pruebas

1. `Health`
2. `Iniciar Juego`
3. `Estado Juego`
4. `Validar Operacion`
5. `Guardar Score`
6. `Ranking`

Nota:

- `Guardar Score` puede responder `400` si el juego aun no termina. Eso es correcto con la logica actual.
