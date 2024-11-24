export interface ApiResponse<T> {
 success: boolean;
 data?: T;
 error?: {
  code: number;
  status: string;
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
 code: number,
 message: string,
 status: string
): ApiResponse<never> => ({
 success: false,
 error: { code, message, status },
});
