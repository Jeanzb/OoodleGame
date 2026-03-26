import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Juego, Usuario, type dificultad_Juego } from "../modelo";
import { juego_Vista } from "../vista/juego_Vista";

export type estado_Pantalla = "inicio" | "juego";
export type estado_Celda = "empty" | "filled" | "correct" | "present" | "absent";

export type intento_Registrado = {
  id: string;
  ecuacion: string;
  numeros: number[];
  estados: estado_Celda[];
  es_Correcta: boolean;
};

export type fila_Tablero = {
  id: string;
  numeros: Array<number | null>;
  estados: estado_Celda[];
  resultado: string;
};

const TOTAL_FILAS_TABLERO = 6;
const TOTAL_NUMEROS_POR_INTENTO = 4;

function mapear_Color_Backend(color: string): estado_Celda {
  if (color === "verde") {
    return "correct";
  }

  if (color === "amarillo") {
    return "present";
  }

  return "absent";
}

function construir_Intento(juego: Juego): intento_Registrado {
  return {
    id: `${juego.get_intentos_Jugador()}-${Date.now()}`,
    ecuacion: juego.get_operacion_Intento_Formateada(),
    numeros: juego.get_numeros_Intento(),
    estados: juego.get_retroalimentacion().map(mapear_Color_Backend),
    es_Correcta: juego.get_es_Correcta(),
  };
}

function crear_Usuario_Desde_Juego(
  juego: Juego,
  usuario_Anterior: Usuario | null,
): Usuario {
  const usuario = new Usuario(
    juego.get_id_Jugador(),
    juego.get_nombre_Jugador(),
    usuario_Anterior?.get_puntaje_Maximo_Usuario() ?? 0,
  );

  usuario.actualizar_Puntaje(juego.get_puntaje_Usuario());
  return usuario;
}

function obtener_Mensaje_Estado(juego: Juego): string {
  if (juego.get_estatus_Juego() === "ganado") {
    return "Completaste la ecuacion. Puedes guardar el puntaje o iniciar una nueva ronda.";
  }

  if (juego.get_estatus_Juego() === "perdido") {
    return "Se agotaron los intentos. Guarda el resultado o vuelve a intentarlo.";
  }

  return "Selecciona cuatro numeros, revisa las pistas de color y encuentra el orden correcto.";
}

function construir_Operacion(numeros: number[]): string {
  return `${numeros[0]}+${numeros[1]}*${numeros[2]}-${numeros[3]}`;
}

function construir_Filas_Tablero(
  historial: intento_Registrado[],
  seleccion_Actual: number[],
  resultado_Objetivo: number,
): fila_Tablero[] {
  const filas: fila_Tablero[] = [];

  for (let indice = 0; indice < TOTAL_FILAS_TABLERO; indice += 1) {
    const intento = historial[indice];

    if (intento) {
      filas.push({
        id: intento.id,
        numeros: intento.numeros.map((numero) => numero ?? null),
        estados: intento.estados,
        resultado: String(resultado_Objetivo),
      });
      continue;
    }

    if (indice === historial.length) {
      filas.push({
        id: `fila-actual-${indice}`,
        numeros: Array.from(
          { length: TOTAL_NUMEROS_POR_INTENTO },
          (_valor, posicion) => seleccion_Actual[posicion] ?? null,
        ),
        estados: Array.from(
          { length: TOTAL_NUMEROS_POR_INTENTO },
          (_valor, posicion) =>
            seleccion_Actual[posicion] === undefined ? "empty" : "filled",
        ),
        resultado: String(resultado_Objetivo),
      });
      continue;
    }

    filas.push({
      id: `fila-vacia-${indice}`,
      numeros: [null, null, null, null],
      estados: ["empty", "empty", "empty", "empty"],
      resultado: String(resultado_Objetivo),
    });
  }

  return filas;
}

function obtener_Prioridad_Estado(estado: estado_Celda): number {
  switch (estado) {
    case "correct":
      return 4;
    case "present":
      return 3;
    case "absent":
      return 2;
    case "filled":
      return 1;
    default:
      return 0;
  }
}

function obtener_Estado_Tecla(
  numero: number,
  historial: intento_Registrado[],
  seleccion_Actual: number[],
): estado_Celda {
  if (seleccion_Actual.includes(numero)) {
    return "filled";
  }

  let mejor_Estado: estado_Celda = "empty";

  for (const intento of historial) {
    intento.numeros.forEach((valor, indice) => {
      if (valor !== numero) {
        return;
      }

      const estado = intento.estados[indice];

      if (
        obtener_Prioridad_Estado(estado) >
        obtener_Prioridad_Estado(mejor_Estado)
      ) {
        mejor_Estado = estado;
      }
    });
  }

  return mejor_Estado;
}

function es_Partida_Finalizada(juego: Juego | null): boolean {
  if (juego === null) {
    return false;
  }

  return (
    juego.get_estatus_Juego() === "ganado" ||
    juego.get_estatus_Juego() === "perdido"
  );
}

export function useJuego(
  vista: juego_Vista,
  cargar_Ranking: () => Promise<void>,
) {
  const [pantalla_Actual, set_Pantalla_Actual] =
    useState<estado_Pantalla>("inicio");
  const [usuario, set_Usuario] = useState<Usuario | null>(null);
  const [juego, set_Juego] = useState<Juego | null>(null);
  const [historial, set_Historial] = useState<intento_Registrado[]>([]);
  const [nombre_Usuario, set_Nombre_Usuario] = useState("");
  const [dificultad, set_Dificultad] = useState<dificultad_Juego>("normal");
  const [seleccion_Actual, set_Seleccion_Actual] = useState<number[]>([]);
  const [mensaje, set_Mensaje] = useState(
    "Configura una partida y entra al tablero cuando quieras empezar.",
  );
  const [error, set_Error] = useState("");
  const [cargando, set_Cargando] = useState(false);
  const [guardando, set_Guardando] = useState(false);
  const [puntaje_Guardado, set_Puntaje_Guardado] = useState(false);
  const [modal_Visible, set_Modal_Visible] = useState(false);

  const recuperar_Partida = useCallback(async () => {
    try {
      const juego_Recuperado = await vista.sincronizar_Estado();
      const usuario_Recuperado = crear_Usuario_Desde_Juego(juego_Recuperado, null);

      set_Juego(juego_Recuperado);
      set_Usuario(usuario_Recuperado);
      set_Nombre_Usuario(usuario_Recuperado.get_nombre_Usuario());
      set_Dificultad(juego_Recuperado.get_dificultad());
      set_Mensaje(obtener_Mensaje_Estado(juego_Recuperado));
      set_Pantalla_Actual("juego");
      set_Modal_Visible(es_Partida_Finalizada(juego_Recuperado));
    } catch {
      // Si no existe una partida activa, la app se queda en la pantalla de bienvenida.
    }
  }, [vista]);

  useEffect(() => {
    void recuperar_Partida();
  }, [recuperar_Partida]);

  async function iniciar_Partida(): Promise<void> {
    set_Error("");
    set_Cargando(true);

    try {
      const respuesta = await vista.iniciar_Juego(
        nombre_Usuario,
        dificultad,
      );

      set_Juego(respuesta.juego);
      set_Usuario(respuesta.usuario);
      set_Historial([]);
      set_Seleccion_Actual([]);
      set_Puntaje_Guardado(false);
      set_Modal_Visible(false);
      set_Mensaje(obtener_Mensaje_Estado(respuesta.juego));
      set_Pantalla_Actual("juego");
    } catch (error_Actual) {
      set_Error(
        error_Actual instanceof Error
          ? error_Actual.message
          : "No se pudo iniciar la partida.",
      );
    } finally {
      set_Cargando(false);
    }
  }

  async function reiniciar_Partida(): Promise<void> {
    const nombre = nombre_Usuario.trim() || usuario?.get_nombre_Usuario() || "";

    if (!nombre) {
      set_Error("Escribe un nombre de jugador antes de reiniciar la partida.");
      return;
    }

    set_Nombre_Usuario(nombre);
    set_Error("");
    set_Cargando(true);

    try {
      const respuesta = await vista.iniciar_Juego(nombre, dificultad);
      set_Juego(respuesta.juego);
      set_Usuario(respuesta.usuario);
      set_Historial([]);
      set_Seleccion_Actual([]);
      set_Puntaje_Guardado(false);
      set_Modal_Visible(false);
      set_Mensaje(obtener_Mensaje_Estado(respuesta.juego));
      set_Pantalla_Actual("juego");
    } catch (error_Actual) {
      set_Error(
        error_Actual instanceof Error
          ? error_Actual.message
          : "No se pudo reiniciar la partida.",
      );
    } finally {
      set_Cargando(false);
    }
  }

  function volver_A_Inicio(): void {
    set_Pantalla_Actual("inicio");
    set_Juego(null);
    set_Historial([]);
    set_Seleccion_Actual([]);
    set_Modal_Visible(false);
    set_Puntaje_Guardado(false);
    set_Error("");
    set_Mensaje("Configura una partida y entra al tablero cuando quieras empezar.");
  }

  function agregar_Numero(numero: number): void {
    if (juego === null || es_Partida_Finalizada(juego)) {
      return;
    }

    if (seleccion_Actual.length >= TOTAL_NUMEROS_POR_INTENTO) {
      set_Error("Cada intento solo puede tener cuatro numeros.");
      return;
    }

    if (seleccion_Actual.includes(numero)) {
      set_Error("No puedes repetir numeros en un mismo intento.");
      return;
    }

    set_Error("");
    set_Seleccion_Actual((estado_Anterior) => [...estado_Anterior, numero]);
  }

  function eliminar_Numero(): void {
    set_Error("");
    set_Seleccion_Actual((estado_Anterior) => estado_Anterior.slice(0, -1));
  }

  async function revisar_Intento(): Promise<void> {
    if (juego === null) {
      set_Error("Primero debes iniciar una partida.");
      return;
    }

    if (seleccion_Actual.length !== TOTAL_NUMEROS_POR_INTENTO) {
      set_Error("Debes completar los cuatro espacios antes de validar.");
      return;
    }

    if (new Set(seleccion_Actual).size !== TOTAL_NUMEROS_POR_INTENTO) {
      set_Error("No puedes repetir numeros en el mismo intento.");
      return;
    }

    set_Error("");
    set_Cargando(true);

    try {
      const juego_Actualizado = await vista.enviar_Respuesta(
        construir_Operacion(seleccion_Actual),
      );
      const usuario_Actualizado = crear_Usuario_Desde_Juego(
        juego_Actualizado,
        usuario,
      );

      set_Juego(juego_Actualizado);
      set_Usuario(usuario_Actualizado);
      set_Historial((estado_Anterior) => [
        ...estado_Anterior,
        construir_Intento(juego_Actualizado),
      ]);
      set_Seleccion_Actual([]);
      set_Mensaje(obtener_Mensaje_Estado(juego_Actualizado));
      set_Modal_Visible(es_Partida_Finalizada(juego_Actualizado));
    } catch (error_Actual) {
      set_Error(
        error_Actual instanceof Error
          ? error_Actual.message
          : "Error al conectar con el backend.",
      );
    } finally {
      set_Cargando(false);
    }
  }

  async function guardar_Puntaje(): Promise<void> {
    if (usuario === null) {
      set_Error("No hay un usuario activo para guardar el puntaje.");
      return;
    }

    set_Error("");
    set_Guardando(true);

    try {
      await vista.guardar_Puntaje(usuario);
      set_Puntaje_Guardado(true);
      set_Mensaje("Puntaje guardado correctamente en el ranking.");
      await cargar_Ranking();
    } catch (error_Actual) {
      set_Error(
        error_Actual instanceof Error
          ? error_Actual.message
          : "No se pudo guardar el puntaje.",
      );
    } finally {
      set_Guardando(false);
    }
  }

  const resultado_Objetivo = juego?.get_resultado_Correcto() ?? 0;

  const filas_Tablero = construir_Filas_Tablero(
    historial,
    seleccion_Actual,
    resultado_Objetivo,
  );

  const rango_Minimo = juego?.get_rango_Minimo() ?? 1;
  const rango_Maximo = juego?.get_rango_Maximo() ?? (dificultad === "dificil" ? 12 : 9);
  const numeros_Teclado = Array.from(
    { length: rango_Maximo - rango_Minimo + 1 },
    (_valor, indice) => rango_Minimo + indice,
  );

  const estados_Teclado = new Map<number, estado_Celda>();
  for (const numero of numeros_Teclado) {
    estados_Teclado.set(
      numero,
      obtener_Estado_Tecla(numero, historial, seleccion_Actual),
    );
  }

  const ecuacion_Mostrada = vista.mostrar_Ecuacion();
  const partida_Finalizada = es_Partida_Finalizada(juego);

  return {
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
    set_Modal_Visible,
  };
}
