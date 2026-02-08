import http, { type FractalResponseData } from "@/api/http";

export default async (code: string, password: string): Promise<string[]> => {
	const { data } = await http.post<FractalResponseData<{ tokens: string[] }>>(
		"/api/client/account/two-factor",
		{
			code,
			password,
		},
	);

	return data.attributes.tokens;
};
