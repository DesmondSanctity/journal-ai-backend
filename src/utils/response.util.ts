export interface ApiResponse<T> {
 success: boolean;
 data?: T;
 error?: {
  code: string;
  message: string;
 };
 meta?: {
  page?: number;
  limit?: number;
  total?: number;
 };
}

export const successResponse = <T>(
 data: T,
 meta?: ApiResponse<T>['meta']
): ApiResponse<T> => ({
 success: true,
 data,
 ...(meta && { meta }),
});

export const errorResponse = (
 code: string,
 message: string
): ApiResponse<never> => ({
 success: false,
 error: { code, message },
});
