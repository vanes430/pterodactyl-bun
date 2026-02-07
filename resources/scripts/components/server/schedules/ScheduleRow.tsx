import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import tw from "twin.macro";
import type { Schedule } from "@/api/server/schedules/getServerSchedules";
import ScheduleCronRow from "@/components/server/schedules/ScheduleCronRow";

export default ({ schedule }: { schedule: Schedule }) => (
	<>
		<div css={tw`hidden md:block text-neutral-400`}>
			<CalendarDays size={20} />
		</div>
		<div css={tw`flex-1 md:ml-4`}>
			<p>{schedule.name}</p>
			<p css={tw`text-xs text-neutral-400`}>
				Last run at:{" "}
				{schedule.lastRunAt
					? format(schedule.lastRunAt, "MMM do 'at' h:mma")
					: "never"}
			</p>
		</div>
		<div>
			<p
				css={[
					tw`py-1 px-3 rounded-full text-[10px] uppercase font-bold sm:hidden tracking-wider`,
					schedule.isActive
						? tw`bg-green-500/20 text-green-400 border border-green-500/20`
						: tw`bg-neutral-500/20 text-neutral-400 border border-neutral-500/20`,
				]}
			>
				{schedule.isActive ? "Active" : "Inactive"}
			</p>
		</div>
		<ScheduleCronRow
			cron={schedule.cron}
			css={tw`mx-auto sm:mx-8 w-full sm:w-auto mt-4 sm:mt-0`}
		/>
		<div>
			<p
				css={[
					tw`py-1 px-3 rounded-full text-[10px] uppercase font-bold hidden sm:block tracking-wider`,
					schedule.isProcessing
						? tw`bg-cyan-500/20 text-cyan-400 border border-cyan-500/20`
						: schedule.isActive
							? tw`bg-green-500/20 text-green-400 border border-green-500/20`
							: tw`bg-neutral-500/20 text-neutral-400 border border-neutral-500/20`,
				]}
			>
				{schedule.isProcessing
					? "Processing"
					: schedule.isActive
						? "Active"
						: "Inactive"}
			</p>
		</div>
	</>
);
