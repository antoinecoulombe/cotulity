const atob = require('atob');

/**
 * Parses a JWT token.
 * @param token The JWT token.
 * @returns An object containing the decoded JWT token information.
 */
export function parseJwt(token: string | null): any {
  if (!token) return null;
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c: any) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );

  return JSON.parse(jsonPayload);
}

/**
 * Extracts the bearer or query token from the request.
 * @param req The HTTP request.
 * @returns If a token is present, the token as a string. Otherwise, null.
 */
export function extractToken(req: any): string | null {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
      return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      return req.query.token;
    }
  } catch (error) {}
  return null;
}
