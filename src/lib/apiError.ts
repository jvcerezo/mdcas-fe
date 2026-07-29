/**
 * Lives in its own module so both the network client and the standalone
 * adapter can throw it without importing each other.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
