import { type SSHKey, Transformers } from "@definitions/user";
import type { SSHKeyAttributes } from "@definitions/user/transformers";
import useSWR, { type SWRConfiguration } from "swr";
import http, {
	type FractalResponseData,
	type FractalResponseList,
	type HttpRequestError,
} from "@/api/http";
import { useUserSWRKey } from "@/plugins/useSWRKey";

const useSSHKeys = (config?: SWRConfiguration<SSHKey[], HttpRequestError>) => {
	const key = useUserSWRKey(["account", "ssh-keys"]);

	return useSWR(
		key,
		async () => {
			const { data } = await http.get<FractalResponseList<SSHKeyAttributes>>(
				"/api/client/account/ssh-keys",
			);

			return data.data.map((datum) => {
				return Transformers.toSSHKey(datum.attributes);
			});
		},
		{ revalidateOnMount: false, ...(config || {}) },
	);
};

const createSSHKey = async (
	name: string,
	publicKey: string,
): Promise<SSHKey> => {
	const { data } = await http.post<FractalResponseData<SSHKeyAttributes>>(
		"/api/client/account/ssh-keys",
		{
			name,
			public_key: publicKey,
		},
	);

	return Transformers.toSSHKey(data.attributes);
};

const deleteSSHKey = async (fingerprint: string): Promise<void> => {
	await http.post("/api/client/account/ssh-keys/remove", { fingerprint });
	return;
};

export { useSSHKeys, createSSHKey, deleteSSHKey };
