# Security boundaries

ProxyFlow is a single-user local diagnostic application, not a public multi-tenant proxy service or an audited privacy product.

The server binds to IPv4 loopback and validates exact Host, Origin and a random session token. Static file paths are allowlisted. Request bodies, subprocess runtimes, response sizes, concurrency and request-start rates are bounded.

cURL is invoked without a shell, with explicit routing and verified TLS. Ambient proxy variables and cURL configuration files are ignored. There is no automatic direct fallback, system proxy change, credential collection, subnet scan or telemetry.

These controls do not make an unknown public proxy trustworthy. Listings may contain endpoints you do not have permission to use. Successful diagnostics do not prove anonymity, security, future uptime, accurate physical geolocation or access to other sites.

Do not send passwords, tokens, banking data or confidential traffic through unknown proxies. Do not publish private scan exports when reporting bugs. Report only the app version, OS, cURL version, error code and sanitized reproduction.

Keep the OS, Python and system cURL updated. Packaged EXEs are unsigned. Do not disable OS protection to run them. Do not expose this app through a public tunnel or reverse proxy.
