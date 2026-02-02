import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { AppException } from "./app.exception";
import { ErrorCode } from "./error-codes";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger("ExceptionFilter");

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let errorCode: string = ErrorCode.INTERNAL_ERROR;

    if (exception instanceof AppException) {
      statusCode = exception.getStatus();
      message = exception.message;
      errorCode = exception.errorCode;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exResponse = exception.getResponse();
      if (typeof exResponse === "string") {
        message = exResponse;
      } else if (typeof exResponse === "object" && exResponse !== null) {
        const r = exResponse as Record<string, any>;
        // class-validator pipes return { message: string[] }
        // class-validator via ValidationPipe: { message: string[], error: "Bad Request", statusCode: 400 }
        // or nested: { message: { message: string[] } }
        const msg = r.message;
        if (Array.isArray(msg)) {
          message = msg.join("; ");
        } else if (typeof msg === "object" && msg !== null && Array.isArray(msg.message)) {
          message = msg.message.join("; ");
        } else if (typeof msg === "string") {
          message = msg;
        }
        errorCode = r.error || errorCode;
      }
      // Map standard NestJS error strings to our error codes
      const isAppErrorCode = Object.values(ErrorCode).includes(errorCode as ErrorCode);
      if (!isAppErrorCode || errorCode === ErrorCode.INTERNAL_ERROR) {
        if (statusCode === 400) errorCode = ErrorCode.VALIDATION_ERROR;
        else if (statusCode === 401) errorCode = ErrorCode.UNAUTHORIZED;
        else if (statusCode === 403) errorCode = ErrorCode.FORBIDDEN;
        else if (statusCode === 404) errorCode = ErrorCode.NOT_FOUND;
        else if (statusCode === 429) errorCode = ErrorCode.RATE_LIMIT_EXCEEDED;
        else errorCode = ErrorCode.INTERNAL_ERROR;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const body = {
      statusCode,
      message,
      error: errorCode,
      timestamp: new Date().toISOString(),
      path: request?.url,
    };

    // Log 5xx errors as errors, others as warnings
    if (statusCode >= 500) {
      this.logger.error(
        `${request?.method} ${request?.url} ${statusCode} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else if (statusCode >= 400) {
      this.logger.warn(`${request?.method} ${request?.url} ${statusCode} - ${message}`);
    }

    response.status(statusCode).json(body);
  }
}
