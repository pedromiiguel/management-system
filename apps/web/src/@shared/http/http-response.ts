export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_CONTENT = 422,
  UNEXPECTED_ERROR = 500,
}

export type HttpResponse<T = unknown> = {
  statusCode: number;
  body: T;
};
