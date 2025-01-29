export interface SocketConfig {
  /**
   * The URL of the socket server to connect to.
   */
  endpoint: string;
  /**
   * List of events to emit when connecting to the Namespace
   */
  emitList: Array<string>;
  /**
   * List of events to listen when connecting from the Namespace
   */
  listenList: Array<string>;

  /**
   * the authentication payload sent when connecting to the Namespace
   *
   * @usageNotes
   *
   * ```ts
   * {..., auth: { token: 'YOUR_AUTH_TOKEN' }}
   * ```
   */
  auth?: Record<string, string>;
  /**
   * If this is a secure connection. Set from the URI passed when connecting
   * @default true
   */
  secure?: boolean;
  /**
   * Should we allow reconnection?
   * @default true
   */
  reconnection?: boolean;
}
