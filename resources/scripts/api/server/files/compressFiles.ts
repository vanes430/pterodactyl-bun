import type { FileObjectAttributes } from "@/api/definitions/api";
import http, { type FractalResponseData } from "@/api/http";
import type { FileObject } from "@/api/server/files/loadDirectory";
import { rawDataToFileObject } from "@/api/transformers";

export default async (
	uuid: string,
	directory: string,
	files: string[],
): Promise<FileObject> => {
	const { data } = await http.post<FractalResponseData<FileObjectAttributes>>(
		`/api/client/servers/${uuid}/files/compress`,
		{ root: directory, files },
		{
			timeout: 60000,
		},
	);

	return rawDataToFileObject(data);
};
