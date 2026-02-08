import { useForm } from "react-hook-form";
import tw from "twin.macro";
import chmodFiles from "@/api/server/files/chmodFiles";
import Button from "@/components/elements/Button";
import FormField from "@/components/elements/FormField";
import Modal, { type RequiredModalProps } from "@/components/elements/Modal";
import { fileBitsToString } from "@/helpers";
import useFileManagerSwr from "@/plugins/useFileManagerSwr";
import useFlash from "@/plugins/useFlash";
import { ServerContext } from "@/state/server";

interface Values {
	mode: string;
}

interface File {
	file: string;
	mode: string;
}

type OwnProps = RequiredModalProps & { files: File[] };

const ChmodFileModal = ({ files, ...props }: OwnProps) => {
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
		reset,
	} = useForm<Values>({
		defaultValues: {
			mode: files.length > 1 ? "" : files[0].mode || "",
		},
	});

	const onSubmit = ({ mode }: Values) => {
		clearFlashes("files");

		mutate(
			(data) =>
				data?.map((f) =>
					f.name === files[0].file
						? { ...f, mode: fileBitsToString(mode, !f.isFile), modeBits: mode }
						: f,
				),
			false,
		);

		const data = files.map((f) => ({ file: f.file, mode: mode }));

		chmodFiles(uuid, directory, data)
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
				<div css={tw`flex flex-wrap items-end`}>
					<div css={tw`w-full sm:flex-1 sm:mr-4`}>
						<FormField
							id={"file_mode"}
							label={"File Mode"}
							autoFocus
							{...register("mode")}
						/>
					</div>
					<div css={tw`w-full sm:w-auto mt-4 sm:mt-0`}>
						<Button css={tw`w-full`} type={"submit"}>
							Update
						</Button>
					</div>
				</div>
			</form>
		</Modal>
	);
};

export default ChmodFileModal;
