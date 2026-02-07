import {
	ArrowDownCircle,
	Clock,
	Command,
	FileArchive,
	Pencil,
	Power,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import tw from "twin.macro";
import { httpErrorToHuman } from "@/api/http";
import deleteScheduleTask from "@/api/server/schedules/deleteScheduleTask";
import type { Schedule, Task } from "@/api/server/schedules/getServerSchedules";
import Can from "@/components/elements/Can";
import ConfirmationModal from "@/components/elements/ConfirmationModal";
import SpinnerOverlay from "@/components/elements/SpinnerOverlay";
import TaskDetailsModal from "@/components/server/schedules/TaskDetailsModal";
import useFlash from "@/plugins/useFlash";
import { ServerContext } from "@/state/server";

interface Props {
	schedule: Schedule;
	task: Task;
}

const getActionDetails = (
	action: string,
): [string, React.ComponentType<any>] => {
	switch (action) {
		case "command":
			return ["Send Command", Command];
		case "power":
			return ["Send Power Action", Power];
		case "backup":
			return ["Create Backup", FileArchive];
		default:
			return ["Unknown Action", Command];
	}
};

export default ({ schedule, task }: Props) => {
	const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
	const { clearFlashes, addError } = useFlash();
	const [visible, setVisible] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const appendSchedule = ServerContext.useStoreActions(
		(actions) => actions.schedules.appendSchedule,
	);

	const onConfirmDeletion = () => {
		setIsLoading(true);
		clearFlashes("schedules");
		deleteScheduleTask(uuid, schedule.id, task.id)
			.then(() =>
				appendSchedule({
					...schedule,
					tasks: schedule.tasks.filter((t) => t.id !== task.id),
				}),
			)
			.catch((error) => {
				console.error(error);
				setIsLoading(false);
				addError({ message: httpErrorToHuman(error), key: "schedules" });
			});
	};

	const [title, Icon] = getActionDetails(task.action);

	return (
		<div
			css={tw`sm:flex items-center p-4 sm:p-6 border-b border-white/5 last:border-b-0`}
		>
			<SpinnerOverlay visible={isLoading} fixed size={"large"} />
			<TaskDetailsModal
				schedule={schedule}
				task={task}
				visible={isEditing}
				onModalDismissed={() => setIsEditing(false)}
			/>
			<ConfirmationModal
				title={"Confirm task deletion"}
				buttonText={"Delete Task"}
				onConfirmed={onConfirmDeletion}
				visible={visible}
				onModalDismissed={() => setVisible(false)}
			>
				Are you sure you want to delete this task? This action cannot be undone.
			</ConfirmationModal>
			<div css={tw`text-neutral-400 hidden md:block`}>
				<Icon size={20} />
			</div>
			<div css={tw`flex-none sm:flex-1 w-full sm:w-auto overflow-x-auto`}>
				<p
					css={tw`md:ml-6 text-neutral-200 uppercase text-xs font-bold tracking-wider`}
				>
					{title}
				</p>
				{task.payload && (
					<div css={tw`md:ml-6 mt-2`}>
						{task.action === "backup" && (
							<p
								css={tw`text-[10px] uppercase text-neutral-500 font-bold mb-1 tracking-wider`}
							>
								Ignoring files & folders:
							</p>
						)}
						<div
							css={tw`font-mono bg-white/[0.05] border border-white/5 rounded py-1 px-2 text-sm w-auto inline-block whitespace-pre-wrap break-all text-neutral-300`}
						>
							{task.payload}
						</div>
					</div>
				)}
			</div>
			<div css={tw`mt-3 sm:mt-0 flex items-center w-full sm:w-auto`}>
				{task.continueOnFailure && (
					<div css={tw`mr-6`}>
						<div
							css={tw`flex items-center px-2 py-1 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-yellow-500/20`}
						>
							<ArrowDownCircle size={12} className={"mr-2"} />
							Continues on Failure
						</div>
					</div>
				)}
				{task.sequenceId > 1 && task.timeOffset > 0 && (
					<div css={tw`mr-6`}>
						<div
							css={tw`flex items-center px-2 py-1 bg-white/10 text-neutral-300 text-[10px] font-bold uppercase tracking-wider rounded-full border border-white/5`}
						>
							<Clock size={12} className={"mr-2"} />
							{task.timeOffset}s later
						</div>
					</div>
				)}
				<Can action={"schedule.update"}>
					<button
						type={"button"}
						aria-label={"Edit scheduled task"}
						css={tw`block text-sm p-2 text-neutral-500 hover:text-neutral-100 transition-colors duration-150 mr-4 ml-auto sm:ml-0`}
						onClick={() => setIsEditing(true)}
					>
						<Pencil size={16} />
					</button>
				</Can>
				<Can action={"schedule.update"}>
					<button
						type={"button"}
						aria-label={"Delete scheduled task"}
						css={tw`block text-sm p-2 text-neutral-500 hover:text-red-500 transition-colors duration-150`}
						onClick={() => setVisible(true)}
					>
						<Trash2 size={16} />
					</button>
				</Can>
			</div>
		</div>
	);
};
