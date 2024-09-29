class UserNotDefinedError extends Error {
  constructor() {
    super("User not defined");
  }
}

export default UserNotDefinedError;
