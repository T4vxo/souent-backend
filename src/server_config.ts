/**
 * Server config.
 */
;

export const devPort = 8004;
/**
 * Without trailing slash.
 */
export const fqdn = `localhost:${devPort}`;
export const protocol = `http`;
export const baseUrl = `${protocol}://${fqdn}`
export const mediaBaseUrl = `/media`
