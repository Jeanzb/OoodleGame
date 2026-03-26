import {
  useCallback,
  useDeferredValue,
  useEffect,
  useState,
  useTransition,
} from "react";

import type { ranking_Registro } from "../servicios";
import { juego_Vista } from "../vista/juego_Vista";

export function useRanking(vista: juego_Vista) {
  const [ranking, set_Ranking] = useState<ranking_Registro[]>([]);
  const [isPending, startTransition] = useTransition();
  const ranking_Diferido = useDeferredValue(ranking);

  const cargar_Ranking = useCallback(async () => {
    const ranking_Actual = await vista.obtener_Ranking();
    startTransition(() => {
      set_Ranking(ranking_Actual);
    });
  }, [vista]);

  useEffect(() => {
    void cargar_Ranking();
  }, [cargar_Ranking]);

  return {
    ranking,
    ranking_Diferido,
    isPending,
    cargar_Ranking,
  };
}
