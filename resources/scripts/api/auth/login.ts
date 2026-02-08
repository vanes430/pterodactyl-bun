import http from "@/api/http";

export interface LoginResponse {
	complete: boolean;
	intended?: string;
	confirmationToken?: string;
}

export interface LoginData {
	username: string;
	password: string;
	recaptchaData?: string | null;
}

interface RawLoginResponse {
	data: {
		complete: boolean;
		intended?: string;
		confirmation_token?: string;
	};
}

export default ({
	username,
	password,
	recaptchaData,
}: LoginData): Promise<LoginResponse> => {
	return new Promise((resolve, reject) => {
		http
			.get("/sanctum/csrf-cookie")
			.then(() =>
				http.post<RawLoginResponse>("/auth/login", {
					user: username,
					password,
					"g-recaptcha-response": recaptchaData,
				}),
			)
			.then((response) => {
				const { data } = response.data;
				return resolve({
					complete: data.complete,
					intended: data.intended || undefined,
					confirmationToken: data.confirmation_token || undefined,
				});
			})
			.catch(reject);
	});
};
