export interface DAO<T> {
  obtener(id: number): Promise<T | null>;
  create(entidad: T): Promise<boolean>;
}
