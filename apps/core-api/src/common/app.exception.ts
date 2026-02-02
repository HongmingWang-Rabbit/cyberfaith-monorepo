import { HttpException, HttpStatus } from "@nestjs/common";
import { ErrorCode } from "./error-codes";

/**
 * Custom exception that carries an app-specific error code.
 */
export class AppException extends HttpException {
  public readonly errorCode: ErrorCode;

  constructor(errorCode: ErrorCode, message: string, statusCode: HttpStatus = HttpStatus.BAD_REQUEST) {
    super({ statusCode, message, error: errorCode }, statusCode);
    this.errorCode = errorCode;
  }
}
