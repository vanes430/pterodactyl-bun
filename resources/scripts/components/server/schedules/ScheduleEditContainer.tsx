import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import isEqual from "react-fast-compare";
import { useHistory, useParams } from "react-router-dom";
import tw from "twin.macro";
import getServerSchedule from "@/api/server/schedules/getServerSchedule";
import { Button } from "@/components/elements/button/index";
import Can from "@/components/elements/Can";
import PageContentBlock from "@/components/elements/PageContentBlock";
import Spinner from "@/components/elements/Spinner";
import FlashMessageRender from "@/components/FlashMessageRender";
import DeleteScheduleButton from "@/components/server/schedules/DeleteScheduleButton";
import EditScheduleModal from "@/components/server/schedules/EditScheduleModal";
import NewTaskButton from "@/components/server/schedules/NewTaskButton";
import RunScheduleButton from "@/components/server/schedules/RunScheduleButton";
import ScheduleCronRow from "@/components/server/schedules/ScheduleCronRow";
import ScheduleTaskRow from "@/components/server/schedules/ScheduleTaskRow";
import useFlash from "@/plugins/useFlash";
import { ServerContext } from "@/state/server";

interface Params {
	id: string;
}

const CronBox = ({ title, value }: { title: string; value: string }) => (
	<div
		css={tw`bg-white/[0.03] border border-white/5 rounded-lg p-3 text-center`}
	>
		<p
			css={tw`text-neutral-500 text-[10px] uppercase font-bold tracking-wider`}
		>
			{title}
		</p>
		<p css={tw`text-xl font-mono text-neutral-100 mt-1`}>{value}</p>
	</div>
);

const ActivePill = ({ active }: { active: boolean }) => (
	<span
		css={[
			tw`rounded-full px-2 py-px text-[10px] ml-4 uppercase font-bold tracking-wider border`,
			active
				? tw`bg-green-500/20 text-green-400 border-green-500/20`
				: tw`bg-red-500/20 text-red-400 border-red-500/20`,
		]}
	>
		{active ? "Active" : "Inactive"}
	</span>
);

export default () => {
	const history = useHistory();
	const { id: scheduleId } = useParams<Params>();

	const id = ServerContext.useStoreState((state) => state.server.data?.id);
	const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);

	const { clearFlashes, clearAndAddHttpError } = useFlash();
	const [isLoading, setIsLoading] = useState(true);
	const [showEditModal, setShowEditModal] = useState(false);

	const schedule = ServerContext.useStoreState(
		(st) => st.schedules.data.find((s) => s.id === Number(scheduleId)),
		isEqual,
	);
	const appendSchedule = ServerContext.useStoreActions(
		(actions) => actions.schedules.appendSchedule,
	);

	useEffect(() => {
		if (schedule?.id === Number(scheduleId)) {
			setIsLoading(false);
			return;
		}

		clearFlashes("schedules");
		getServerSchedule(uuid, Number(scheduleId))
			.then((schedule) => appendSchedule(schedule))
			.catch((error) => {
				console.error(error);
				clearAndAddHttpError({ error, key: "schedules" });
			})
			.then(() => setIsLoading(false));
	}, [
		scheduleId,
		appendSchedule,
		clearAndAddHttpError,
		clearFlashes,
		schedule?.id,
		uuid,
	]);

	const toggleEditModal = useCallback(() => {
		setShowEditModal((s) => !s);
	}, []);

	return (
		<PageContentBlock title={"Schedules"}>
			<FlashMessageRender byKey={"schedules"} css={tw`mb-4`} />
			{!schedule || isLoading ? (
				<Spinner size={"large"} centered />
			) : (
				<>
					<ScheduleCronRow
						cron={schedule.cron}
						css={tw`sm:hidden bg-white/[0.03] border border-white/5 rounded-lg mb-4 p-3`}
					/>
					<div css={tw`rounded-xl overflow-hidden`}>
						<div
							css={tw`sm:flex items-center bg-white/[0.03] p-4 sm:p-6 border border-white/5 rounded-t-xl`}
						>
							<div css={tw`flex-1`}>
								<h3
									css={tw`flex items-center text-neutral-100 text-2xl font-header font-bold`}
								>
									{schedule.name}
									{schedule.isProcessing ? (
										<span
											css={tw`flex items-center rounded-full px-2 py-px text-[10px] ml-4 uppercase font-bold tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/20`}
										>
											<Spinner css={tw`w-3! h-3! mr-2`} />
											Processing
										</span>
									) : (
										<ActivePill active={schedule.isActive} />
									)}
								</h3>
								<p css={tw`mt-1 text-sm text-neutral-400`}>
									Last run at:&nbsp;
									{schedule.lastRunAt ? (
										<span css={tw`text-neutral-200`}>
											{format(schedule.lastRunAt, "MMM do 'at' h:mma")}
										</span>
									) : (
										<span>n/a</span>
									)}
									<span css={tw`ml-4 pl-4 border-l border-white/10 py-px`}>
										Next run at:&nbsp;
										{schedule.nextRunAt ? (
											<span css={tw`text-neutral-200`}>
												{format(schedule.nextRunAt, "MMM do 'at' h:mma")}
											</span>
										) : (
											<span>n/a</span>
										)}
									</span>
								</p>
							</div>
							<div css={tw`flex sm:block mt-3 sm:mt-0`}>
								<Can action={"schedule.update"}>
									<Button.Text
										className={"flex-1 mr-4"}
										onClick={toggleEditModal}
									>
										Edit
									</Button.Text>
									<NewTaskButton schedule={schedule} />
								</Can>
							</div>
						</div>
						<div
							css={tw`hidden sm:grid grid-cols-5 md:grid-cols-5 gap-4 mb-4 mt-4`}
						>
							<CronBox title={"Minute"} value={schedule.cron.minute} />
							<CronBox title={"Hour"} value={schedule.cron.hour} />
							<CronBox title={"Day (Month)"} value={schedule.cron.dayOfMonth} />
							<CronBox title={"Month"} value={schedule.cron.month} />
							<CronBox title={"Day (Week)"} value={schedule.cron.dayOfWeek} />
						</div>
						<div
							css={tw`bg-white/[0.02] border border-white/5 rounded-b-xl overflow-hidden`}
						>
							{schedule.tasks.length > 0 ? (
								schedule.tasks
									.sort((a, b) =>
										a.sequenceId === b.sequenceId
											? 0
											: a.sequenceId > b.sequenceId
												? 1
												: -1,
									)
									.map((task) => (
										<ScheduleTaskRow
											key={`${schedule.id}_${task.id}`}
											task={task}
											schedule={schedule}
										/>
									))
							) : (
								<p css={tw`p-6 text-center text-neutral-400 text-sm`}>
									No tasks configured for this schedule.
								</p>
							)}
						</div>
					</div>
					<EditScheduleModal
						visible={showEditModal}
						schedule={schedule}
						onModalDismissed={toggleEditModal}
					/>
					<div css={tw`mt-6 flex sm:justify-end`}>
						<Can action={"schedule.delete"}>
							<DeleteScheduleButton
								scheduleId={schedule.id}
								onDeleted={() => history.push(`/server/${id}/schedules`)}
							/>
						</Can>
						{schedule.tasks.length > 0 && (
							<Can action={"schedule.update"}>
								<RunScheduleButton schedule={schedule} />
							</Can>
						)}
					</div>
				</>
			)}
		</PageContentBlock>
	);
};
