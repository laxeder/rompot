class ChatNotDefinedError extends Error {
  constructor() {
    super("Chat not defined");
  }
}

export default ChatNotDefinedError;
