import { join } from "pathe";
import { useForm } from "react-hook-form";
import tw from "twin.macro";
import renameFiles from "@/api/server/files/renameFiles";
import Button from "@/components/elements/Button";
import FormField from "@/components/elements/FormField";
import Modal, { type RequiredModalProps } from "@/components/elements/Modal";
import useFileManagerSwr from "@/plugins/useFileManagerSwr";
import useFlash from "@/plugins/useFlash";
import { ServerContext } from "@/state/server";

interface Values {
	name: string;
}

type OwnProps = RequiredModalProps & {
	files: string[];
	useMoveTerminology?: boolean;
};

const RenameFileModal = ({ files, useMoveTerminology, ...props }: OwnProps) => {
	const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
	const { mutate } = useFileManagerSwr();
	const { clearFlashes, clearAndAddHttpError } = useFlash();
	const directory = ServerContext.useStoreState(
		(state) => state.files.directory,
	);
	const setSelectedFiles = ServerContext.useStoreActions(
		(actions) => actions.files.setSelectedFiles,
	);

	const {
		register,
		handleSubmit,
		formState: { isSubmitting },
		watch,
		reset,
	} = useForm<Values>({
		defaultValues: {
			name: files.length > 1 ? "" : files[0] || "",
		},
	});

	const name = watch("name");

	const onSubmit = ({ name }: Values) => {
		clearFlashes("files");

		const len = name.split("/").length;
		if (files.length === 1) {
			if (!useMoveTerminology && len === 1) {
				// Rename the file within this directory.
				mutate(
					(data) =>
						data?.map((f) => (f.name === files[0] ? { ...f, name } : f)),
					false,
				);
			} else if (useMoveTerminology || len > 1) {
				// Remove the file from this directory since they moved it elsewhere.
				mutate((data) => data?.filter((f) => f.name !== files[0]), false);
			}
		}

		let data: { from: string; to: string }[];
		if (useMoveTerminology && files.length > 1) {
			data = files.map((f) => ({ from: f, to: join(name, f) }));
		} else {
			data = files.map((f) => ({ from: f, to: name }));
		}

		renameFiles(uuid, directory, data)
			.then(
				(): Promise<any> => (files.length > 0 ? mutate() : Promise.resolve()),
			)
			.then(() => setSelectedFiles([]))
			.catch((error) => {
				mutate();
				clearAndAddHttpError({ key: "files", error });
			})
			.then(() => {
				reset();
				props.onDismissed();
			});
	};

	return (
		<Modal
			{...props}
			dismissable={!isSubmitting}
			showSpinnerOverlay={isSubmitting}
		>
			<form css={tw`m-0`} onSubmit={handleSubmit(onSubmit)}>
				<div
					css={[
						tw`flex flex-wrap`,
						useMoveTerminology ? tw`items-center` : tw`items-end`,
					]}
				>
					<div css={tw`w-full sm:flex-1 sm:mr-4`}>
						<FormField
							id={"file_name"}
							label={"File Name"}
							description={
								useMoveTerminology
									? "Enter the new name and directory of this file or folder, relative to the current directory."
									: undefined
							}
							autoFocus
							{...register("name")}
						/>
					</div>
					<div css={tw`w-full sm:w-auto mt-4 sm:mt-0`}>
						<Button css={tw`w-full`} type={"submit"}>
							{useMoveTerminology ? "Move" : "Rename"}
						</Button>
					</div>
				</div>
				{useMoveTerminology && (
					<p css={tw`text-xs mt-2 text-neutral-400`}>
						<strong css={tw`text-neutral-200`}>New location:</strong>
						&nbsp;/home/container/
						{join(directory, name || "").replace(/^(\.\.\/|\/)+/, "")}
					</p>
				)}
			</form>
		</Modal>
	);
};

export default RenameFileModal;
