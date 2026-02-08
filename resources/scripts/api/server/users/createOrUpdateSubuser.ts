import http, { type FractalResponseData } from "@/api/http";
import {
	rawDataToServerSubuser,
	type SubuserResponseAttributes,
} from "@/api/server/users/getServerSubusers";
import type { Subuser } from "@/state/server/subusers";

interface Params {
	email: string;
	permissions: string[];
}

export default (
	uuid: string,
	params: Params,
	subuser?: Subuser,
): Promise<Subuser> => {
	return new Promise((resolve, reject) => {
		http
			.post<FractalResponseData<SubuserResponseAttributes>>(
				`/api/client/servers/${uuid}/users${subuser ? `/${subuser.uuid}` : ""}`,
				{
					...params,
				},
			)
			.then((data) => resolve(rawDataToServerSubuser(data.data)))
			.catch(reject);
	});
};
