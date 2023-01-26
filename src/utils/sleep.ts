/**
 * * Aguarda um determinado tempo
 * @param timeout
 * @returns
 */
export default async function sleep(timeout: number = 1000): Promise<void> {
  const result = timeout - 2147483647;

  if (result > 0) {
    await new Promise((res) => setTimeout(res, 2147483647));

    await sleep(result);
  } else {
    await new Promise((res) => setTimeout(res, timeout));
  }
}
