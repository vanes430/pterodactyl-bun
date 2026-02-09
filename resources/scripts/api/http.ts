import { store } from "@/state";

export class HttpRequestError extends Error {
	constructor(
		message: string,
		public response: Response,
		public data: unknown,
	) {
		super(message);
		this.name = "HttpRequestError";
		Object.defineProperty(this, "response", { enumerable: false });
	}
}

interface HttpResponse<T> {
	data: T;
}

type RequestInterceptor = (
	config: RequestInit & { params?: Record<string, unknown>; timeout?: number },
) =>
	| (RequestInit & { params?: Record<string, unknown>; timeout?: number })
	| Promise<
			RequestInit & { params?: Record<string, unknown>; timeout?: number }
	  >;
type ResponseInterceptor = (
	response: Response,
	data: unknown,
) => unknown | Promise<unknown>;
type ErrorInterceptor = (error: HttpRequestError) => unknown | Promise<unknown>;

class HttpClient {
	private requestInterceptors: RequestInterceptor[] = [];
	private responseInterceptors: {
		onFullfilled?: ResponseInterceptor;
		onRejected?: ErrorInterceptor;
	}[] = [];

	constructor(private defaults: RequestInit = {}) {}

	get interceptors() {
		return {
			request: {
				use: (interceptor: RequestInterceptor) => {
					this.requestInterceptors.push(interceptor);
				},
			},
			response: {
				use: (
					onFullfilled?: ResponseInterceptor,
					onRejected?: ErrorInterceptor,
				) => {
					this.responseInterceptors.push({ onFullfilled, onRejected });
				},
			},
		};
	}

	async request<T>(
		url: string,
		config: RequestInit & {
			params?: Record<string, unknown>;
			timeout?: number;
		} = {},
	): Promise<HttpResponse<T>> {
		type FullConfig = RequestInit & {
			params?: Record<string, unknown>;
			timeout?: number;
		};
		let finalConfig: FullConfig = {
			...this.defaults,
			...config,
			headers: {
				...(this.defaults.headers as Record<string, string>),
				...(config.headers as Record<string, string>),
			},
		};

		for (const interceptor of this.requestInterceptors) {
			finalConfig = (await interceptor(finalConfig)) as FullConfig;
		}

		const { params, timeout, ...fetchConfig } = finalConfig;
		let finalUrl = url;

		if (params) {
			const searchParams = new URLSearchParams();
			for (const [key, value] of Object.entries(params)) {
				if (value !== undefined && value !== null) {
					if (Array.isArray(value)) {
						for (const v of value) searchParams.append(`${key}[]`, String(v));
					} else {
						searchParams.append(key, String(value));
					}
				}
			}
			const queryString = searchParams.toString();
			if (queryString) {
				finalUrl += (url.includes("?") ? "&" : "?") + queryString;
			}
		}

		const controller = new AbortController();
		const id = timeout ? setTimeout(() => controller.abort(), timeout) : null;

		try {
			const response = await fetch(finalUrl, {
				...fetchConfig,
				signal: config.signal || controller.signal,
			});
			if (id) clearTimeout(id);

			let data: unknown;
			const contentType = response.headers.get("content-type");
			if (contentType?.includes("application/json")) {
				data = await response.json();
			} else {
				data = await response.text();
			}

			if (!response.ok) {
				const error = new HttpRequestError(
					`Request failed with status ${response.status}`,
					response,
					data,
				);

				for (const { onRejected } of this.responseInterceptors) {
					if (onRejected) {
						await onRejected(error);
					}
				}

				throw error;
			}

			let finalData = data;
			for (const { onFullfilled } of this.responseInterceptors) {
				if (onFullfilled) {
					finalData = await onFullfilled(response, finalData);
				}
			}

			return { data: finalData as T };
		} catch (error) {
			if (id) clearTimeout(id);
			if (error instanceof HttpRequestError) {
				throw error;
			}

			throw new HttpRequestError(
				(error as Error).message,
				new Response(null, { status: 0 }),
				null,
			);
		}
	}

	get<T = unknown>(
		url: string,
		config?: RequestInit & {
			params?: Record<string, unknown>;
			timeout?: number;
		},
	) {
		return this.request<T>(url, { ...config, method: "GET" });
	}

	post<T = unknown>(
		url: string,
		data?: unknown,
		config?: RequestInit & {
			params?: Record<string, unknown>;
			timeout?: number;
		},
	) {
		const isFormData = data instanceof FormData;
		const isString = typeof data === "string";
		let body: any;
		if (isFormData || isString) {
			body = data;
		} else {
			try {
				body = JSON.stringify(data);
			} catch (e) {
				console.error("Failed to stringify request data:", e, data);
				const cache = new Set();
				body = JSON.stringify(data, (_key, value) => {
					if (typeof value === "object" && value !== null) {
						try {
							if (cache.has(value)) return "[Circular]";
							cache.add(value);
						} catch (e) {
							return "[Unaccessible]";
						}
					}
					return value;
				});
			}
		}

		return this.request<T>(url, {
			...config,
			method: "POST",
			body,
			headers: {
				...(isFormData || isString
					? {}
					: { "Content-Type": "application/json" }),
				...config?.headers,
			},
		});
	}

	put<T = unknown>(
		url: string,
		data?: unknown,
		config?: RequestInit & {
			params?: Record<string, unknown>;
			timeout?: number;
		},
	) {
		const isString = typeof data === "string";
		let body: any;
		if (isString) {
			body = data;
		} else {
			try {
				body = JSON.stringify(data);
			} catch (e) {
				console.error("Failed to stringify request data:", e, data);
				const cache = new Set();
				body = JSON.stringify(data, (_key, value) => {
					if (typeof value === "object" && value !== null) {
						if (cache.has(value)) return "[Circular]";
						cache.add(value);
					}
					return value;
				});
			}
		}

		return this.request<T>(url, {
			...config,
			method: "PUT",
			body,
			headers: {
				...(isString ? {} : { "Content-Type": "application/json" }),
				...config?.headers,
			},
		});
	}

	patch<T = unknown>(
		url: string,
		data?: unknown,
		config?: RequestInit & {
			params?: Record<string, unknown>;
			timeout?: number;
		},
	) {
		const isString = typeof data === "string";
		let body: any;
		if (isString) {
			body = data;
		} else {
			try {
				body = JSON.stringify(data);
			} catch (e) {
				console.error("Failed to stringify request data:", e, data);
				const cache = new Set();
				body = JSON.stringify(data, (_key, value) => {
					if (typeof value === "object" && value !== null) {
						if (cache.has(value)) return "[Circular]";
						cache.add(value);
					}
					return value;
				});
			}
		}

		return this.request<T>(url, {
			...config,
			method: "PATCH",
			body,
			headers: {
				...(isString ? {} : { "Content-Type": "application/json" }),
				...config?.headers,
			},
		});
	}

	delete<T = unknown>(
		url: string,
		config?: RequestInit & {
			params?: Record<string, unknown>;
			timeout?: number;
		},
	) {
		return this.request<T>(url, { ...config, method: "DELETE" });
	}

	upload<T = unknown>(
		url: string,
		data: FormData,
		config?: {
			params?: Record<string, unknown>;
			onUploadProgress?: (progress: ProgressEvent) => void;
			signal?: AbortSignal;
		},
	): Promise<HttpResponse<T>> {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			let finalUrl = url;

			if (config?.params) {
				const searchParams = new URLSearchParams();
				for (const [key, value] of Object.entries(config.params)) {
					searchParams.append(key, String(value));
				}
				finalUrl += (url.includes("?") ? "&" : "?") + searchParams.toString();
			}

			xhr.open("POST", finalUrl);
			xhr.withCredentials = true;
			xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
			xhr.setRequestHeader("Accept", "application/json");

			if (config?.onUploadProgress) {
				xhr.upload.onprogress = config.onUploadProgress;
			}

			if (config?.signal) {
				config.signal.addEventListener("abort", () => xhr.abort());
			}

			xhr.onload = () => {
				let responseData: unknown;
				try {
					responseData = JSON.parse(xhr.responseText);
				} catch {
					responseData = xhr.responseText;
				}

				if (xhr.status >= 200 && xhr.status < 300) {
					resolve({ data: responseData as T });
				} else {
					reject(
						new HttpRequestError(
							`Upload failed with status ${xhr.status}`,
							new Response(xhr.responseText, { status: xhr.status }),
							responseData,
						),
					);
				}
			};

			xhr.onerror = () =>
				reject(
					new HttpRequestError(
						"Network error",
						new Response(null, { status: 0 }),
						null,
					),
				);
			xhr.send(data);
		});
	}
}

const http = new HttpClient({
	credentials: "same-origin",
	headers: {
		"X-Requested-With": "XMLHttpRequest",
		Accept: "application/json",
	},
});

http.interceptors.request.use((req) => {
	if (typeof req.window === "undefined") {
		store.getActions().progress.startContinuous();
	}

	const getCookie = (name: string) => {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop()?.split(";").shift();
	};

	let token = getCookie("XSRF-TOKEN");
	if (!token) {
		const element = document.querySelector('meta[name="csrf-token"]');
		if (element) {
			token = element.getAttribute("content") || undefined;
		}
	}

	if (token) {
		req.headers = {
			...req.headers,
			"X-XSRF-TOKEN": decodeURIComponent(token),
		};
	}

	return req;
});

http.interceptors.response.use(
	(response, data) => {
		if (!response.url.endsWith("/resources")) {
			store.getActions().progress.setComplete();
		}
		return data;
	},
	(error) => {
		store.getActions().progress.setComplete();
		throw error;
	},
);

export default http;

export function httpErrorToHuman(error: unknown): string {
	if (typeof error === "string") {
		return error;
	}

	if (error instanceof HttpRequestError && error.data) {
		const data = error.data as {
			errors?: { detail: string }[];
			error?: string;
		};

		if (data.errors?.[0]?.detail) {
			return data.errors[0].detail;
		}

		if (data.error && typeof data.error === "string") {
			return data.error;
		}
	}

	return error instanceof Error ? error.message : "An unknown error occurred.";
}

export interface FractalResponseData<T = any> {
	object: string;
	attributes: T;
	relationships?: Record<string, unknown>;
}

export interface FractalResponseList<T = any> {
	object: "list";
	data: FractalResponseData<T>[];
}

export interface FractalPaginatedResponse<T = any>
	extends FractalResponseList<T> {
	meta: {
		pagination: {
			total: number;
			count: number;
			per_page: number;
			current_page: number;
			total_pages: number;
		};
	};
}

export interface PaginatedResult<T> {
	items: T[];
	pagination: PaginationDataSet;
}

export interface PaginationDataSet {
	total: number;
	count: number;
	perPage: number;
	currentPage: number;
	totalPages: number;
}

export function getPaginationSet(data: any): PaginationDataSet {
	return {
		total: data.total,
		count: data.count,
		perPage: data.per_page,
		currentPage: data.current_page,
		totalPages: data.total_pages,
	};
}

export interface QueryBuilderParams<
	FilterKeys extends string = string,
	SortKeys extends string = string,
> {
	page?: number;
	filters?: {
		[K in FilterKeys]?:
			| string
			| number
			| boolean
			| null
			| Readonly<(string | number | boolean | null)[]>;
	};
	sorts?: {
		[K in SortKeys]?: -1 | 0 | 1 | "asc" | "desc" | null;
	};
}

export const withQueryBuilderParams = (
	data?: QueryBuilderParams,
): Record<string, unknown> => {
	if (!data) return {};

	const filters = Object.keys(data.filters || {}).reduce(
		(obj, key) => {
			const value = data.filters?.[key];
			if (value && value !== "") {
				obj[`filter[${key}]`] = value;
			}
			return obj;
		},
		{} as Record<string, unknown>,
	);

	const sorts = Object.keys(data.sorts || {}).reduce((arr, key) => {
		const value = data.sorts?.[key];
		if (value && ["asc", "desc", 1, -1].includes(value)) {
			arr.push((value === -1 || value === "desc" ? "-" : "") + key);
		}
		return arr;
	}, [] as string[]);

	return {
		...filters,
		sort: !sorts.length ? undefined : sorts.join(","),
		page: data.page,
	};
};
