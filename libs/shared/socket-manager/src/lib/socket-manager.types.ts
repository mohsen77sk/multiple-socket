export interface SocketConfig {
  /**
   * The URL of the socket server to connect to.
   */
  endpoint: string;
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
}
