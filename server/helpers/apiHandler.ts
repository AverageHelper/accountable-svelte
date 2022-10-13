import { assertMethod } from "./assertMethod";
import { handleErrors } from "../handleErrors";
import { OriginError } from "../errors/OriginError";
import { URL } from "node:url";

type HTTPMethod = "GET" | "POST" | "DELETE";

/**
 * Creates a serverless function for a given HTTP method and handles errors.
 *
 * @param method The HTTP method that this function should accept. If the
 * request's method does not match this one for any reason, then a response
 * with code 405 is returned to the client.
 */
export function apiHandler(method: HTTPMethod, cb: APIRequestHandler): APIRequestHandler {
	return async (req, res) => {
		await handleErrors(req, res, async (req, res) => {
			assertCors(req, res);
			if (req.method === "OPTIONS") {
				res.status(200).end();
				return;
			}
			assertMethod(req.method, method);
			await cb(req, res);
		});
	};
}

const allowedOriginHostnames = new Set<string>();

// Add typical localhost variants
allowedOriginHostnames.add("localhost");
allowedOriginHostnames.add("127.0.0.1");
allowedOriginHostnames.add("::1");

console.debug(`allowedOriginHostnames: ${JSON.stringify(Array.from(allowedOriginHostnames))}`);

function assertCors(req: APIRequest, res: APIResponse): void {
	// Allow requests with no origin (mobile apps, curl, etc.)
	const origin = req.headers.origin;
	if (origin === undefined || !origin) {
		console.debug(`Handling request that has no origin`);
		return;
	}

	// Guard Origin
	try {
		const { hostname } = new URL(origin);

		if (!allowedOriginHostnames.has(hostname)) {
			console.debug(`Blocking request from origin: ${origin} (inferred hostname: ${hostname}`);
			throw new OriginError();
		}
	} catch {
		console.debug(`Blocking request from origin: ${origin} (inferred hostname: <invalid-url>`);
		throw new OriginError();
	}

	// Origin must be OK! Let 'em in
	console.debug(`Handling request from origin: ${origin}`);
	res.setHeader("Access-Control-Allow-Origin", origin);
	res.setHeader("Access-Control-Allow-Credentials", "true");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
	);
}