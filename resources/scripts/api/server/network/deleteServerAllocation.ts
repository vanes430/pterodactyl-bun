import http from "@/api/http";

export default async (uuid: string, id: number): Promise<void> => {
	await http.delete(`/api/client/servers/${uuid}/network/allocations/${id}`);
};
