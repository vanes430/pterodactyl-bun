import type {
	AllocationAttributes,
	EggVariableAttributes,
} from "@/api/definitions/api";
import http, {
	type FractalResponseData,
	type FractalResponseList,
} from "@/api/http";
import type { ServerEggVariable, ServerStatus } from "@/api/server/types";
import {
	rawDataToServerAllocation,
	rawDataToServerEggVariable,
} from "@/api/transformers";

export interface Allocation {
	id: number;
	ip: string;
	alias: string | null;
	port: number;
	notes: string | null;
	isDefault: boolean;
}

export interface Server {
	id: string;
	internalId: number | string;
	uuid: string;
	name: string;
	node: string;
	isNodeUnderMaintenance: boolean;
	status: ServerStatus;
	sftpDetails: {
		ip: string;
		port: number;
	};
	invocation: string;
	dockerImage: string;
	description: string;
	limits: {
		memory: number;
		swap: number;
		disk: number;
		io: number;
		cpu: number;
		threads: string;
	};
	eggFeatures: string[];
	featureLimits: {
		databases: number;
		allocations: number;
		backups: number;
	};
	isTransferring: boolean;
	variables: ServerEggVariable[];
	allocations: Allocation[];
}

export interface ServerResponseAttributes {
	identifier: string;
	internal_id: number;
	uuid: string;
	name: string;
	node: string;
	is_node_under_maintenance: boolean;
	status: ServerStatus;
	invocation: string;
	docker_image: string;
	sftp_details: {
		ip: string;
		port: number;
	};
	description: string | null;
	limits: {
		memory: number;
		swap: number;
		disk: number;
		io: number;
		cpu: number;
		threads: string;
	};
	egg_features: string[];
	feature_limits: {
		databases: number;
		allocations: number;
		backups: number;
	};
	is_transferring: boolean;
	relationships?: {
		variables?: FractalResponseList<EggVariableAttributes>;
		allocations?: FractalResponseList<AllocationAttributes>;
	};
}

export const rawDataToServerObject = ({
	attributes: data,
}: FractalResponseData<ServerResponseAttributes>): Server => ({
	id: data.identifier,
	internalId: data.internal_id,
	uuid: data.uuid,
	name: data.name,
	node: data.node,
	isNodeUnderMaintenance: data.is_node_under_maintenance,
	status: data.status,
	invocation: data.invocation,
	dockerImage: data.docker_image,
	sftpDetails: {
		ip: data.sftp_details.ip,
		port: data.sftp_details.port,
	},
	description: data.description || "",
	limits: { ...data.limits },
	eggFeatures: data.egg_features || [],
	featureLimits: { ...data.feature_limits },
	isTransferring: data.is_transferring,
	variables: (data.relationships?.variables?.data || []).map(
		rawDataToServerEggVariable,
	),
	allocations: (data.relationships?.allocations?.data || []).map(
		rawDataToServerAllocation,
	),
});

export default (uuid: string): Promise<[Server, string[]]> => {
	return new Promise((resolve, reject) => {
		http
			.get<
				FractalResponseData<ServerResponseAttributes> & {
					meta: { is_server_owner: boolean; user_permissions: string[] };
				}
			>(`/api/client/servers/${uuid}`)
			.then(({ data }) =>
				resolve([
					rawDataToServerObject(data),
					data.meta?.is_server_owner
						? ["*"]
						: data.meta?.user_permissions || [],
				]),
			)
			.catch(reject);
	});
};
