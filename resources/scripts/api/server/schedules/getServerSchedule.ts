import http, { type FractalResponseData } from "@/api/http";
import {
	rawDataToServerSchedule,
	type Schedule,
	type ScheduleAttributes,
} from "@/api/server/schedules/getServerSchedules";

export default (uuid: string, schedule: number): Promise<Schedule> => {
	return new Promise((resolve, reject) => {
		http
			.get<FractalResponseData<ScheduleAttributes>>(
				`/api/client/servers/${uuid}/schedules/${schedule}`,
				{
					params: {
						include: ["tasks"],
					},
				},
			)
			.then(({ data }) => resolve(rawDataToServerSchedule(data.attributes)))
			.catch(reject);
	});
};
