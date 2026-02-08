import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import tw from "twin.macro";
import { z } from "zod";
import createServerBackup from "@/api/server/backups/createServerBackup";
import getServerBackups from "@/api/swr/getServerBackups";
import Button from "@/components/elements/Button";
import Can from "@/components/elements/Can";
import FormField from "@/components/elements/FormField";
import FormSwitch from "@/components/elements/FormSwitch";
import { Textarea } from "@/components/elements/Input";
import Modal from "@/components/elements/Modal";
import FlashMessageRender from "@/components/FlashMessageRender";
import useFlash from "@/plugins/useFlash";
import { ServerContext } from "@/state/server";

const schema = z.object({
	name: z.string().max(191, "Backup name must not exceed 191 characters."),
	ignored: z.string(),
	isLocked: z.boolean(),
});

type Values = z.infer<typeof schema>;

export default () => {
	const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
	const { clearFlashes, clearAndAddHttpError } = useFlash();
	const [visible, setVisible] = useState(false);
	const { mutate } = getServerBackups();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		control,
		reset,
	} = useForm<Values>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: "",
			ignored: "",
			isLocked: false,
		},
	});

	useEffect(() => {
		clearFlashes("backups:create");
	}, [clearFlashes]);

	const onSubmit = (values: Values) => {
		clearFlashes("backups:create");
		createServerBackup(uuid, values)
			.then((backup) => {
				mutate(
					(data) => ({
						...data,
						items: (data?.items || []).concat(backup),
						backupCount: (data?.backupCount || 0) + 1,
					}),
					false,
				);
				setVisible(false);
				reset();
			})
			.catch((error) => {
				clearAndAddHttpError({ key: "backups:create", error });
			});
	};

	return (
		<>
			<Modal
				appear
				visible={visible}
				onDismissed={() => {
					setVisible(false);
					reset();
				}}
				showSpinnerOverlay={isSubmitting}
			>
				<form onSubmit={handleSubmit(onSubmit)}>
					<FlashMessageRender byKey={"backups:create"} css={tw`mb-4`} />
					<h2 css={tw`text-2xl mb-6`}>Create server backup</h2>
					<FormField
						id={"name"}
						{...register("name")}
						label={"Backup name"}
						description={
							"If provided, the name that should be used to reference this backup."
						}
						error={errors.name?.message}
					/>
					<div css={tw`mt-6`}>
						<FormField
							id={"ignored"}
							{...register("ignored")}
							label={"Ignored Files & Directories"}
							description={`
                                Enter the files or folders to ignore while generating this backup. Leave blank to use
                                the contents of the .pteroignore file in the root of the server directory if present.
                                Wildcard matching of files and folders is supported in addition to negating a rule by
                                prefixing the path with an exclamation point.
                            `}
							as={Textarea}
							rows={6}
							error={errors.ignored?.message}
						/>
					</div>
					<Can action={"backup.delete"}>
						<div
							css={tw`mt-6 bg-neutral-700 border border-neutral-800 shadow-inner p-4 rounded`}
						>
							<FormSwitch
								name={"isLocked"}
								control={control}
								label={"Locked"}
								description={
									"Prevents this backup from being deleted until explicitly unlocked."
								}
							/>
						</div>
					</Can>
					<div css={tw`flex justify-end mt-6`}>
						<Button type={"submit"} disabled={isSubmitting}>
							Start backup
						</Button>
					</div>
				</form>
			</Modal>
			<Button css={tw`w-full sm:w-auto`} onClick={() => setVisible(true)}>
				Create backup
			</Button>
		</>
	);
};
