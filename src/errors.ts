export class HivePredictError extends Error {
  public readonly statusCode: number;
  public readonly response: unknown;

  constructor(message: string, statusCode: number, response?: unknown) {
    super(message);
    this.name = 'HivePredictError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

export class NetworkError extends Error {
  constructor(message: string, options?: { cause?: Error }) {
    super(message, options);
    this.name = 'NetworkError';
  }
}
