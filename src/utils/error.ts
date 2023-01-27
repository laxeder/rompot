/**
 * @param err
 * @returns Retorna um erro
 */
export function getError(err: any): any {
  if (!(err instanceof Error)) {
    err = new Error(`${err}`);
  }

  return err;
}
