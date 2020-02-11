export default class HttpError extends Error {
  status: number;
  data: object;
  code: string;
  constructor(status = 500, code: string = null, message: string, data: object = null) {
    super(message);

    this.code = code;
    this.message = message;
    this.status = status;
    this.data = data;
  }

  toJSON(): object {
    return {
      status: this.status,
      code: this.code,
      message: this.message,
      data: this.data,
    };
  }
}
