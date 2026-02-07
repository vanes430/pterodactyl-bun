import classNames from "classnames";
import type { Schedule } from "@/api/server/schedules/getServerSchedules";

interface Props {
	cron: Schedule["cron"];
	className?: string;
}

const ScheduleCronRow = ({ cron, className }: Props) => (
	<div className={classNames("flex", className)}>
		<div className={"w-1/5 sm:w-auto text-center"}>
			<p className={"font-mono text-neutral-100"}>{cron.minute}</p>
			<p className={"text-[10px] text-neutral-500 uppercase font-bold"}>Min</p>
		</div>
		<div className={"w-1/5 sm:w-auto text-center ml-4"}>
			<p className={"font-mono text-neutral-100"}>{cron.hour}</p>
			<p className={"text-[10px] text-neutral-500 uppercase font-bold"}>Hour</p>
		</div>
		<div className={"w-1/5 sm:w-auto text-center ml-4"}>
			<p className={"font-mono text-neutral-100"}>{cron.dayOfMonth}</p>
			<p className={"text-[10px] text-neutral-500 uppercase font-bold"}>DOM</p>
		</div>
		<div className={"w-1/5 sm:w-auto text-center ml-4"}>
			<p className={"font-mono text-neutral-100"}>{cron.month}</p>
			<p className={"text-[10px] text-neutral-500 uppercase font-bold"}>
				Month
			</p>
		</div>
		<div className={"w-1/5 sm:w-auto text-center ml-4"}>
			<p className={"font-mono text-neutral-100"}>{cron.dayOfWeek}</p>
			<p className={"text-[10px] text-neutral-500 uppercase font-bold"}>DOW</p>
		</div>
	</div>
);

export default ScheduleCronRow;
