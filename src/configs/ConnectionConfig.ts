export default interface ConnectionConfig {
  /** Desativar execução do comando automático */
  disableAutoCommand: boolean;
  /** Desativa a execução do comando automático para mensagens não oficiais */
  disableAutoCommandForUnofficialMessage: boolean;
  /** Desativar a digitação automatica */
  disableAutoTyping: boolean;
  /** Desativar a leitura automatica de uma mensagem */
  disableAutoRead: boolean;
  /** Máximo de reconexões possíveis */
  maxReconnectTimes: number;
  /** Tempo de aguarde para se reconectar */
  reconnectTimeout: number;
}
