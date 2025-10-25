import { NextResponse } from 'next/server';

/**
 * 401 Unauthorized レスポンスを返す
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * 400 Bad Request レスポンスを返す
 */
export function badRequestResponse(message: string): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 400 }
  );
}

/**
 * 403 Forbidden レスポンスを返す
 */
export function forbiddenResponse(message: string = 'Forbidden'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  );
}

/**
 * 404 Not Found レスポンスを返す
 */
export function notFoundResponse(message: string = 'Not found'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 404 }
  );
}

/**
 * 429 Too Many Requests レスポンスを返す
 */
export function rateLimitResponse(message: string): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 429 }
  );
}

/**
 * 500 Internal Server Error レスポンスを返す
 */
export function serverErrorResponse(message: string): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 500 }
  );
}
