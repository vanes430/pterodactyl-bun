import type { LoginResponse } from "@/api/auth/login";
import http from "@/api/http";

interface RawCheckpointResponse {
	data: {
		complete: boolean;
		intended?: string;
	};
}

export default (
	token: string,
	code: string,
	recoveryToken?: string,
): Promise<LoginResponse> => {
	return new Promise((resolve, reject) => {
		http
			.post<RawCheckpointResponse>("/auth/login/checkpoint", {
				confirmation_token: token,
				authentication_code: code,
				recovery_token:
					recoveryToken && recoveryToken.length > 0 ? recoveryToken : undefined,
			})
			.then((response) => {
				const { data } = response.data;
				return resolve({
					complete: data.complete,
					intended: data.intended || undefined,
				});
			})
			.catch(reject);
	});
};
