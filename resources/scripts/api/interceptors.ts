import type { History } from "history";
import http, { type HttpRequestError } from "@/api/http";

export const setupInterceptors = (history: History) => {
	http.interceptors.response.use(
		(_, data) => data,
		(error: HttpRequestError) => {
			if (error.response?.status === 400) {
				if (
					(error.data as Record<string, any>).errors?.[0].code ===
					"TwoFactorAuthRequiredException"
				) {
					if (!window.location.pathname.startsWith("/account")) {
						history.replace("/account", { twoFactorRedirect: true });
					}
				}
			}
			throw error;
		},
	);
};
