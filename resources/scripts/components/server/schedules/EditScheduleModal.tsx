import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import tw from "twin.macro";
import { z } from "zod";
import { httpErrorToHuman } from "@/api/http";
import createOrUpdateSchedule from "@/api/server/schedules/createOrUpdateSchedule";
import type { Schedule } from "@/api/server/schedules/getServerSchedules";
import { Button } from "@/components/elements/button/index";
import FormField from "@/components/elements/FormField";
import FormSwitch from "@/components/elements/FormSwitch";
import Switch from "@/components/elements/Switch";
import FlashMessageRender from "@/components/FlashMessageRender";
import ScheduleCheatsheetCards from "@/components/server/schedules/ScheduleCheatsheetCards";
import ModalContext from "@/context/ModalContext";
import asModal from "@/hoc/asModal";
import useFlash from "@/plugins/useFlash";
import { ServerContext } from "@/state/server";

interface Props {
	schedule?: Schedule;
}

const schema = z.object({
	name: z.string().min(1, "A schedule name must be provided."),
	dayOfWeek: z.string().min(1, "A day of week must be provided."),
	month: z.string().min(1, "A month must be provided."),
	dayOfMonth: z.string().min(1, "A day of month must be provided."),
	hour: z.string().min(1, "An hour must be provided."),
	minute: z.string().min(1, "A minute must be provided."),
	enabled: z.boolean(),
	onlyWhenOnline: z.boolean(),
});

type Values = z.infer<typeof schema>;

const EditScheduleModal = ({ schedule }: Props) => {
	const { addError, clearFlashes } = useFlash();
	const { dismiss } = useContext(ModalContext);

	const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
	const appendSchedule = ServerContext.useStoreActions(
		(actions) => actions.schedules.appendSchedule,
	);
	const [showCheatsheet, setShowCheetsheet] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		control,
	} = useForm<Values>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: schedule?.name || "",
			minute: schedule?.cron.minute || "*/5",
			hour: schedule?.cron.hour || "*",
			dayOfMonth: schedule?.cron.dayOfMonth || "*",
			month: schedule?.cron.month || "*",
			dayOfWeek: schedule?.cron.dayOfWeek || "*",
			enabled: schedule?.isActive ?? true,
			onlyWhenOnline: schedule?.onlyWhenOnline ?? true,
		},
	});

	useEffect(() => {
		return () => {
			clearFlashes("schedule:edit");
		};
	}, [clearFlashes]);

	const onSubmit = (values: Values) => {
		clearFlashes("schedule:edit");
		createOrUpdateSchedule(uuid, {
			id: schedule?.id,
			name: values.name,
			cron: {
				minute: values.minute,
				hour: values.hour,
				dayOfWeek: values.dayOfWeek,
				month: values.month,
				dayOfMonth: values.dayOfMonth,
			},
			onlyWhenOnline: values.onlyWhenOnline,
			isActive: values.enabled,
		})
			.then((schedule) => {
				appendSchedule(schedule);
				dismiss();
			})
			.catch((error) => {
				console.error(error);
				addError({ key: "schedule:edit", message: httpErrorToHuman(error) });
			});
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<h3 css={tw`text-2xl mb-6`}>
				{schedule ? "Edit schedule" : "Create new schedule"}
			</h3>
			<FlashMessageRender byKey={"schedule:edit"} css={tw`mb-6`} />
			<FormField
				id={"name"}
				{...register("name")}
				label={"Schedule name"}
				description={"A human readable identifier for this schedule."}
				error={errors.name?.message}
			/>
			<div css={tw`grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6`}>
				<FormField
					id={"minute"}
					{...register("minute")}
					label={"Minute"}
					error={errors.minute?.message}
				/>
				<FormField
					id={"hour"}
					{...register("hour")}
					label={"Hour"}
					error={errors.hour?.message}
				/>
				<FormField
					id={"dayOfMonth"}
					{...register("dayOfMonth")}
					label={"Day of month"}
					error={errors.dayOfMonth?.message}
				/>
				<FormField
					id={"month"}
					{...register("month")}
					label={"Month"}
					error={errors.month?.message}
				/>
				<FormField
					id={"dayOfWeek"}
					{...register("dayOfWeek")}
					label={"Day of week"}
					error={errors.dayOfWeek?.message}
				/>
			</div>
			<p css={tw`text-neutral-400 text-xs mt-2`}>
				The schedule system supports the use of Cronjob syntax when defining
				when tasks should begin running. Use the fields above to specify when
				these tasks should begin running.
			</p>
			<div css={tw`mt-6 bg-white/[0.03] border border-white/5 p-4 rounded-xl`}>
				<Switch
					name={"show_cheatsheet"}
					description={"Show the cron cheatsheet for some examples."}
					label={"Show Cheatsheet"}
					defaultChecked={showCheatsheet}
					onChange={() => setShowCheetsheet((s) => !s)}
				/>
				{showCheatsheet && (
					<div css={tw`block md:flex w-full mt-6`}>
						<ScheduleCheatsheetCards />
					</div>
				)}
			</div>
			<div css={tw`mt-4 bg-white/[0.03] border border-white/5 p-4 rounded-xl`}>
				<FormSwitch
					name={"onlyWhenOnline"}
					control={control}
					description={
						"Only execute this schedule when the server is in a running state."
					}
					label={"Only When Server Is Online"}
				/>
			</div>
			<div css={tw`mt-4 bg-white/[0.03] border border-white/5 p-4 rounded-xl`}>
				<FormSwitch
					name={"enabled"}
					control={control}
					description={
						"This schedule will be executed automatically if enabled."
					}
					label={"Schedule Enabled"}
				/>
			</div>
			<div css={tw`mt-6 text-right`}>
				<Button
					className={"w-full sm:w-auto"}
					type={"submit"}
					disabled={isSubmitting}
				>
					{schedule ? "Save changes" : "Create schedule"}
				</Button>
			</div>
		</form>
	);
};

export default asModal<Props>()(EditScheduleModal);
