import http, { type FractalResponseData } from "@/api/http";
import type { PanelPermissions } from "@/state/permissions";

export default (): Promise<PanelPermissions> => {
	return new Promise((resolve, reject) => {
		http
			.get<FractalResponseData<{ permissions: PanelPermissions }>>(
				"/api/client/permissions",
			)
			.then(({ data }) => resolve(data.attributes.permissions))
			.catch(reject);
	});
};
