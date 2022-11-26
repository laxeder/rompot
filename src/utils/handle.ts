/**
 * * Retorna o erro ou resultado de uma Promise
 * @param {*} promise 
 * @returns 
 */
export function handle (promise: Promise<any>): Promise<[any, any]> {
  return new Promise((resolve, reject) => {
    promise
      .then((data) => {
        resolve([null, data]);
      })
      .catch((err) => {
        resolve([err, null]);
      });
  });
};