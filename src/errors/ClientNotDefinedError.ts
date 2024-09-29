class ClientNotDefinedError extends Error {
  constructor() {
    super("Client not defined");
  }
}

export default ClientNotDefinedError;
