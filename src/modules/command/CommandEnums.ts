/** Tipo da chave do comando */
export enum CMDKeyType {
  /** Chaves simples (includes all) */
  Sample = "sample",
  /** Chave exata (startsWith) */
  Exact = "exact",
}

/** Tipo da execução do comando */
export enum CMDRunType {
  /** Execução normal */
  Exec = "exec",
  /** Resposta ao comando */
  Reply = "reply",
}
