import type { ServerBackupAttributes } from "@/api/definitions/api";
import http, { type FractalResponseData } from "@/api/http";
import type { ServerBackup } from "@/api/server/types";
import { rawDataToServerBackup } from "@/api/transformers";

interface RequestParameters {
	name?: string;
	ignored?: string;
	isLocked: boolean;
}

export default async (
	uuid: string,
	params: RequestParameters,
): Promise<ServerBackup> => {
	const { data } = await http.post<FractalResponseData<ServerBackupAttributes>>(
		`/api/client/servers/${uuid}/backups`,
		{
			name: params.name,
			ignored: params.ignored,
			is_locked: params.isLocked,
		},
	);

	return rawDataToServerBackup(data);
};
