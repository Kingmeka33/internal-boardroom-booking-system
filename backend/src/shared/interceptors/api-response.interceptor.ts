import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, map } from "rxjs";

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  path?: string;
  timestamp: string;
};

@Injectable()
export class ApiResponseInterceptor<T>
  implements NestInterceptor<T, ApiSuccessResponse<T>>
{
  // Wraps successful API responses in one predictable response shape.
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponse<T>> {
    const request = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map((data) => {
        if (
          data &&
          typeof data === "object" &&
          "success" in data &&
          "data" in data
        ) {
          return data as unknown as ApiSuccessResponse<T>;
        }

        return {
          success: true,
          data,
          path: request?.url,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
