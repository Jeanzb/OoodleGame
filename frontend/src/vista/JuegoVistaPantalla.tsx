import { useState, type FormEvent } from "react";

import { useJuego, useRanking } from "../hooks";
import { juego_Vista } from "./juego_Vista";

const OPERADORES = ["+", "\u00D7", "-"] as const;

function obtener_Clase_Celda(estado: string): string {
  return `tablero_Celda tablero_Celda--${estado}`;
}

function obtener_Clase_Tecla(estado: string): string {
  return `tecla_Numerica tecla_Numerica--${estado}`;
}

function Icono_Home() {
  return (
    <svg
      aria-hidden="true"
      className="icono"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 10.5L12 4l8 6.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M6.5 9.5V20h11V9.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M10 20v-5h4v5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function JuegoVistaPantalla() {
  const [vista] = useState(() => new juego_Vista());
  const { ranking_Diferido, isPending, cargar_Ranking } = useRanking(vista);
  const {
    pantalla_Actual,
    usuario,
    juego,
    nombre_Usuario,
    dificultad,
    mensaje,
    error,
    cargando,
    guardando,
    puntaje_Guardado,
    modal_Visible,
    filas_Tablero,
    numeros_Teclado,
    estados_Teclado,
    seleccion_Actual,
    ecuacion_Mostrada,
    partida_Finalizada,
    set_Nombre_Usuario,
    set_Dificultad,
    iniciar_Partida,
    reiniciar_Partida,
    volver_A_Inicio,
    agregar_Numero,
    eliminar_Numero,
    revisar_Intento,
    guardar_Puntaje,
  } = useJuego(vista, cargar_Ranking);

  function on_Submit_Inicio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void iniciar_Partida();
  }

  if (pantalla_Actual === "inicio") {
    return (
      <main className="pantalla_Inicio">
        <section className="panel panel--bienvenida">
          <p className="kicker">Ooodle</p>
          <h1>Encuentra el orden exacto de cuatro numeros.</h1>
          <p className="descripcion">
            El backend genera la solucion y el resultado objetivo. En esta pantalla
            solo preparas la partida; el tablero aparece cuando la inicias.
          </p>

          <form className="formulario_Juego" onSubmit={on_Submit_Inicio}>
            <label className="campo">
              <span>Nombre del jugador</span>
              <input
                value={nombre_Usuario}
                onChange={(event) => set_Nombre_Usuario(event.target.value)}
                placeholder="Escribe tu nombre"
                maxLength={24}
              />
            </label>

            <div className="campo">
              <span>Dificultad</span>
              <div className="selector_Dificultad">
                <button
                  type="button"
                  className={
                    dificultad === "normal" ? "chip chip--activa" : "chip"
                  }
                  onClick={() => set_Dificultad("normal")}
                >
                  Normal · 1 a 9
                </button>
                <button
                  type="button"
                  className={
                    dificultad === "dificil" ? "chip chip--activa" : "chip"
                  }
                  onClick={() => set_Dificultad("dificil")}
                >
                  Dificil · 1 a 12
                </button>
              </div>
            </div>

            <button
              className="boton_Principal"
              type="submit"
              disabled={cargando}
            >
              {cargando ? "Iniciando..." : "Iniciar partida"}
            </button>
          </form>

          {error ? <div className="alerta_Error">{error}</div> : null}

          <div className="resumen_Usuario">
            <div>
              <span className="etiqueta_Resumen">Jugador actual</span>
              <strong>{usuario?.get_nombre_Usuario() || "Sin iniciar"}</strong>
            </div>
            <div>
              <span className="etiqueta_Resumen">Mejor puntaje</span>
              <strong>{usuario?.get_puntaje_Maximo_Usuario() ?? 0}</strong>
            </div>
          </div>
        </section>

        <aside className="panel panel--ranking">
          <div className="cabecera_Ranking">
            <div>
              <p className="kicker">Ranking</p>
              <h2>Tabla de puntajes</h2>
            </div>
            <button
              className="boton_Icono"
              type="button"
              onClick={() => void cargar_Ranking()}
              disabled={isPending}
            >
              Actualizar
            </button>
          </div>

          <p className="descripcion descripcion--compacta">{mensaje}</p>

          <div className="ranking_Lista">
            {ranking_Diferido.length === 0 && (
              <p className="ranking_Vacio">
                Aun no hay puntajes visibles. Termina una partida y guarda el resultado.
              </p>
            )}

            {ranking_Diferido.map((registro, indice) => (
              <article
                className="ranking_Item"
                key={`${registro.nombre_jugador}-${indice}`}
              >
                <div>
                  <span className="ranking_Posicion">#{indice + 1}</span>
                  <strong>{registro.nombre_jugador}</strong>
                </div>
                <div className="ranking_Datos">
                  <span>{registro.estado}</span>
                  <strong>{registro.puntaje}</strong>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </main>
    );
  }

  return (
    <main className="pantalla_Juego">
      <header className="encabezado_Juego">
        <button className="boton_Casa" type="button" onClick={volver_A_Inicio}>
          <Icono_Home />
          <span className="sr_Only">Ir al inicio</span>
        </button>
        <h1 className="titulo_Juego">Ooodle</h1>
        <button
          className="boton_Reiniciar"
          type="button"
          onClick={() => void reiniciar_Partida()}
          disabled={cargando}
        >
          Restart
        </button>
      </header>

      <section className="bloque_Principal">
        <p className="texto_Guia">Find the 4 numbers: {ecuacion_Mostrada}</p>

        {error ? <div className="alerta_Error alerta_Error--centrada">{error}</div> : null}

        <div className="tablero_Grid" role="grid" aria-label="Tablero del juego">
          {filas_Tablero.map((fila, indice_Fila) => (
            <div className="fila_Tablero" key={fila.id} role="row">
              {fila.numeros.map((numero, indice) => (
                <div className="segmento_Fila" key={`${fila.id}-${indice}`}>
                  <div className={obtener_Clase_Celda(fila.estados[indice])} role="gridcell">
                    {numero ?? ""}
                  </div>
                  {indice < fila.numeros.length - 1 ? (
                    <span className="operador_Tablero">{OPERADORES[indice]}</span>
                  ) : null}
                </div>
              ))}
              <span className="operador_Tablero">=</span>
              <div className="resultado_Tablero">{fila.resultado}</div>
              <span className="fila_Numero">{indice_Fila + 1}</span>
            </div>
          ))}
        </div>

        <section className="leyenda_Juego">
          <p>
            Verde: numero en posicion correcta. Amarillo: numero presente en otra
            posicion. Gris: numero ausente en la solucion.
          </p>
          <p>
            Objetivo: reconstruir la expresion A + B × C - D con cuatro numeros
            enteros unicos. Dispones de un maximo de 6 intentos.
          </p>
        </section>

        <section className="teclado_Numerico" aria-label="Teclado numerico">
          <div className="teclado_Grid">
            {numeros_Teclado.map((numero) => {
              const estado = estados_Teclado.get(numero) ?? "empty";

              return (
                <button
                  key={numero}
                  className={obtener_Clase_Tecla(estado)}
                  type="button"
                  onClick={() => agregar_Numero(numero)}
                  disabled={
                    juego === null ||
                    partida_Finalizada ||
                    cargando ||
                    seleccion_Actual.includes(numero)
                  }
                >
                  {numero}
                </button>
              );
            })}
          </div>

          <div className="acciones_Teclado">
            <button
              className="boton_Secundario boton_Secundario--teclado"
              type="button"
              onClick={eliminar_Numero}
              disabled={seleccion_Actual.length === 0 || cargando}
            >
              Delete
            </button>
            <button
              className="boton_Principal boton_Principal--teclado"
              type="button"
              onClick={() => void revisar_Intento()}
              disabled={cargando || juego === null || partida_Finalizada}
            >
              Check
            </button>
          </div>
        </section>
      </section>

      {modal_Visible && juego !== null ? (
        <div className="modal_Fondo" role="presentation">
          <div className="modal_Final" role="dialog" aria-modal="true">
            <div
              className={
                juego.get_estatus_Juego() === "ganado"
                  ? "modal_Icono modal_Icono--victoria"
                  : "modal_Icono modal_Icono--derrota"
              }
            >
              {juego.get_estatus_Juego() === "ganado" ? "OK" : "X"}
            </div>
            <h2>
              {juego.get_estatus_Juego() === "ganado"
                ? "Victoria"
                : "Derrota"}
            </h2>
            <p className="modal_Texto">{mensaje}</p>
            <p className="modal_Solucion">
              Solucion correcta: <strong>{juego.get_solucion_Formateada()}</strong>
            </p>
            <div className="modal_Acciones">
              <button
                className="boton_Secundario"
                type="button"
                onClick={() => void guardar_Puntaje()}
                disabled={guardando || puntaje_Guardado}
              >
                {puntaje_Guardado ? "Puntaje guardado" : "Guardar puntaje"}
              </button>
              <button
                className="boton_Principal"
                type="button"
                onClick={() => void reiniciar_Partida()}
                disabled={cargando}
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
