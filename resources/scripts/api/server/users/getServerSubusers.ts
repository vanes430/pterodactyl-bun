import http, {
	type FractalResponseData,
	type FractalResponseList,
} from "@/api/http";
import type { Subuser, SubuserPermission } from "@/state/server/subusers";

export interface SubuserResponseAttributes {
	uuid: string;
	username: string;
	email: string;
	image: string;
	"2fa_enabled": boolean;
	created_at: string;
	permissions: SubuserPermission[];
}

export const rawDataToServerSubuser = (
	data: FractalResponseData<SubuserResponseAttributes>,
): Subuser => ({
	uuid: data.attributes.uuid,
	username: data.attributes.username,
	email: data.attributes.email,
	image: data.attributes.image,
	twoFactorEnabled: data.attributes["2fa_enabled"],
	createdAt: new Date(data.attributes.created_at),
	permissions: data.attributes.permissions || [],
	can: (permission) =>
		(data.attributes.permissions || []).indexOf(permission) >= 0,
});

export default (uuid: string): Promise<Subuser[]> => {
	return new Promise((resolve, reject) => {
		http
			.get<FractalResponseList<SubuserResponseAttributes>>(
				`/api/client/servers/${uuid}/users`,
			)
			.then(({ data }) =>
				resolve((data.data || []).map(rawDataToServerSubuser)),
			)
			.catch(reject);
	});
};
