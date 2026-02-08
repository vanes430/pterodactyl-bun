import http, { type FractalResponseList } from "@/api/http";

export interface Schedule {
	id: number;
	name: string;
	cron: {
		dayOfWeek: string;
		month: string;
		dayOfMonth: string;
		hour: string;
		minute: string;
	};
	isActive: boolean;
	isProcessing: boolean;
	onlyWhenOnline: boolean;
	lastRunAt: Date | null;
	nextRunAt: Date | null;
	createdAt: Date;
	updatedAt: Date;

	tasks: Task[];
}

export interface Task {
	id: number;
	sequenceId: number;
	action: string;
	payload: string;
	timeOffset: number;
	isQueued: boolean;
	continueOnFailure: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface TaskAttributes {
	id: number;
	sequence_id: number;
	action: string;
	payload: string;
	time_offset: number;
	is_queued: boolean;
	continue_on_failure: boolean;
	created_at: string;
	updated_at: string;
}

export interface ScheduleAttributes {
	id: number;
	name: string;
	cron: {
		day_of_week: string;
		month: string;
		day_of_month: string;
		hour: string;
		minute: string;
	};
	is_active: boolean;
	is_processing: boolean;
	only_when_online: boolean;
	last_run_at: string | null;
	next_run_at: string | null;
	created_at: string;
	updated_at: string;
	relationships?: {
		tasks?: FractalResponseList<TaskAttributes>;
	};
}

export const rawDataToServerTask = (data: TaskAttributes): Task => ({
	id: data.id,
	sequenceId: data.sequence_id,
	action: data.action,
	payload: data.payload,
	timeOffset: data.time_offset,
	isQueued: data.is_queued,
	continueOnFailure: data.continue_on_failure,
	createdAt: new Date(data.created_at),
	updatedAt: new Date(data.updated_at),
});

export const rawDataToServerSchedule = (
	data: ScheduleAttributes,
): Schedule => ({
	id: data.id,
	name: data.name,
	cron: {
		dayOfWeek: data.cron.day_of_week,
		month: data.cron.month,
		dayOfMonth: data.cron.day_of_month,
		hour: data.cron.hour,
		minute: data.cron.minute,
	},
	isActive: data.is_active,
	isProcessing: data.is_processing,
	onlyWhenOnline: data.only_when_online,
	lastRunAt: data.last_run_at ? new Date(data.last_run_at) : null,
	nextRunAt: data.next_run_at ? new Date(data.next_run_at) : null,
	createdAt: new Date(data.created_at),
	updatedAt: new Date(data.updated_at),

	tasks: (data.relationships?.tasks?.data || []).map((row) =>
		rawDataToServerTask(row.attributes),
	),
});

export default async (uuid: string): Promise<Schedule[]> => {
	const { data } = await http.get<FractalResponseList<ScheduleAttributes>>(
		`/api/client/servers/${uuid}/schedules`,
		{
			params: {
				include: ["tasks"],
			},
		},
	);

	return (data.data || []).map((row) =>
		rawDataToServerSchedule(row.attributes),
	);
};
