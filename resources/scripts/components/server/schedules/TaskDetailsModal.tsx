import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import tw from "twin.macro";
import { z } from "zod";
import { httpErrorToHuman } from "@/api/http";
import createOrUpdateScheduleTask from "@/api/server/schedules/createOrUpdateScheduleTask";
import type { Schedule, Task } from "@/api/server/schedules/getServerSchedules";
import { Button } from "@/components/elements/button/index";
import FormField from "@/components/elements/FormField";
import FormSwitch from "@/components/elements/FormSwitch";
import { Textarea } from "@/components/elements/Input";
import Select from "@/components/elements/Select";
import FlashMessageRender from "@/components/FlashMessageRender";
import ModalContext from "@/context/ModalContext";
import asModal from "@/hoc/asModal";
import useFlash from "@/plugins/useFlash";
import { ServerContext } from "@/state/server";

interface Props {
	schedule: Schedule;
	// If a task is provided we can assume we're editing it. If not provided,
	// we are creating a new one.
	task?: Task;
}

const schema = z
	.object({
		action: z.enum(["command", "power", "backup"]),
		payload: z.string(),
		continueOnFailure: z.boolean(),
		timeOffset: z.coerce
			.number()
			.min(0, "The time offset must be at least 0 seconds.")
			.max(900, "The time offset must be less than 900 seconds."),
	})
	.superRefine((data, ctx) => {
		if (data.action !== "backup" && data.payload.length === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "A task payload must be provided.",
				path: ["payload"],
			});
		}
	});

type Values = z.input<typeof schema>;

const TaskDetailsModal = ({ schedule, task }: Props) => {
	const { dismiss } = useContext(ModalContext);
	const { clearFlashes, addError } = useFlash();

	const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
	const appendSchedule = ServerContext.useStoreActions(
		(actions) => actions.schedules.appendSchedule,
	);
	const backupLimit = ServerContext.useStoreState(
		(state) => state.server.data?.featureLimits.backups,
	);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		control,
		watch,
		setValue,
	} = useForm<Values>({
		resolver: zodResolver(schema),
		defaultValues: {
			action: (task?.action as any) || "command",
			payload: task?.payload || "",
			timeOffset: task?.timeOffset || 0,
			continueOnFailure: task?.continueOnFailure || false,
		},
	});

	const action = watch("action");

	useEffect(() => {
		return () => {
			clearFlashes("schedule:task");
		};
	}, [clearFlashes]);

	// Replace ActionListener functionality
	useEffect(() => {
		if (!task) {
			if (action === "power") {
				setValue("payload", "start");
			} else {
				setValue("payload", "");
			}
		}
	}, [action, task, setValue]);

	const onSubmit = (values: Values) => {
		clearFlashes("schedule:task");
		if (backupLimit === 0 && values.action === "backup") {
			addError({
				message:
					"A backup task cannot be created when the server's backup limit is set to 0.",
				key: "schedule:task",
			});
		} else {
			createOrUpdateScheduleTask(uuid, schedule.id, task?.id, {
				...values,
				timeOffset: values.timeOffset.toString(),
			})
				.then((task) => {
					let tasks = schedule.tasks.map((t) => (t.id === task.id ? task : t));
					if (!schedule.tasks.find((t) => t.id === task.id)) {
						tasks = [...tasks, task];
					}

					appendSchedule({ ...schedule, tasks });
					dismiss();
				})
				.catch((error) => {
					console.error(error);
					addError({ message: httpErrorToHuman(error), key: "schedule:task" });
				});
		}
	};

	return (
		<form css={tw`m-0`} onSubmit={handleSubmit(onSubmit)}>
			<FlashMessageRender byKey={"schedule:task"} css={tw`mb-4`} />
			<h2 css={tw`text-2xl mb-6`}>{task ? "Edit Task" : "Create Task"}</h2>
			<div css={tw`flex`}>
				<div css={tw`mr-2 w-1/3`}>
					<FormField
						id={"action"}
						label={"Action"}
						as={Select}
						{...register("action")}
						error={errors.action?.message}
					>
						<option value={"command"}>Send command</option>
						<option value={"power"}>Send power action</option>
						<option value={"backup"}>Create backup</option>
					</FormField>
				</div>
				<div css={tw`flex-1 ml-6`}>
					<FormField
						id={"timeOffset"}
						label={"Time offset (in seconds)"}
						description={
							"The amount of time to wait after the previous task executes before running this one. If this is the first task on a schedule this will not be applied."
						}
						{...register("timeOffset")}
						error={errors.timeOffset?.message}
					/>
				</div>
			</div>
			<div css={tw`mt-6`}>
				{action === "command" ? (
					<FormField
						id={"payload"}
						label={"Payload"}
						as={Textarea}
						rows={6}
						{...register("payload")}
						error={errors.payload?.message}
					/>
				) : action === "power" ? (
					<FormField
						id={"payload"}
						label={"Payload"}
						as={Select}
						{...register("payload")}
						error={errors.payload?.message}
					>
						<option value={"start"}>Start the server</option>
						<option value={"restart"}>Restart the server</option>
						<option value={"stop"}>Stop the server</option>
						<option value={"kill"}>Terminate the server</option>
					</FormField>
				) : (
					<FormField
						id={"payload"}
						label={"Ignored Files"}
						description={
							"Optional. Include the files and folders to be excluded in this backup. By default, the contents of your .pteroignore file will be used. If you have reached your backup limit, the oldest backup will be rotated."
						}
						as={Textarea}
						rows={6}
						{...register("payload")}
						error={errors.payload?.message}
					/>
				)}
			</div>
			<div css={tw`mt-6 bg-white/[0.03] border border-white/5 p-4 rounded-xl`}>
				<FormSwitch
					name={"continueOnFailure"}
					control={control}
					description={"Future tasks will be run when this task fails."}
					label={"Continue on Failure"}
				/>
			</div>
			<div css={tw`flex justify-end mt-6`}>
				<Button type={"submit"} disabled={isSubmitting}>
					{task ? "Save Changes" : "Create Task"}
				</Button>
			</div>
		</form>
	);
};

export default asModal<Props>()(TaskDetailsModal);
