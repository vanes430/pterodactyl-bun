import http, { type FractalResponseData } from "@/api/http";

export type ServerPowerState = "offline" | "starting" | "running" | "stopping";

export interface ServerStats {
	status: ServerPowerState;
	isSuspended: boolean;
	memoryUsageInBytes: number;
	cpuUsagePercent: number;
	diskUsageInBytes: number;
	networkRxInBytes: number;
	networkTxInBytes: number;
	uptime: number;
}

interface RawServerStats {
	current_state: ServerPowerState;
	is_suspended: boolean;
	resources: {
		memory_bytes: number;
		cpu_absolute: number;
		disk_bytes: number;
		network_rx_bytes: number;
		network_tx_bytes: number;
		uptime: number;
	};
}

export default (server: string): Promise<ServerStats> => {
	return new Promise((resolve, reject) => {
		http
			.get<FractalResponseData<RawServerStats>>(
				`/api/client/servers/${server}/resources`,
			)
			.then(({ data: { attributes } }) =>
				resolve({
					status: attributes.current_state,
					isSuspended: attributes.is_suspended,
					memoryUsageInBytes: attributes.resources.memory_bytes,
					cpuUsagePercent: attributes.resources.cpu_absolute,
					diskUsageInBytes: attributes.resources.disk_bytes,
					networkRxInBytes: attributes.resources.network_rx_bytes,
					networkTxInBytes: attributes.resources.network_tx_bytes,
					uptime: attributes.resources.uptime,
				}),
			)
			.catch(reject);
	});
};
