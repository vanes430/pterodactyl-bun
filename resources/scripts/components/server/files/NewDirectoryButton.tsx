import { zodResolver } from "@hookform/resolvers/zod";
import { join } from "pathe";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import tw from "twin.macro";
import { z } from "zod";
import createDirectory from "@/api/server/files/createDirectory";
import type { FileObject } from "@/api/server/files/loadDirectory";
import { Button } from "@/components/elements/button/index";
import Code from "@/components/elements/Code";
import { Dialog, DialogWrapperContext } from "@/components/elements/dialog";
import FormField from "@/components/elements/FormField";
import FlashMessageRender from "@/components/FlashMessageRender";
import type { WithClassname } from "@/components/types";
import asDialog from "@/hoc/asDialog";
import useFileManagerSwr from "@/plugins/useFileManagerSwr";
import { useFlashKey } from "@/plugins/useFlash";
import { ServerContext } from "@/state/server";

const schema = z.object({
	directoryName: z.string().min(1, "A valid directory name must be provided."),
});

type Values = z.infer<typeof schema>;

const generateDirectoryData = (name: string): FileObject => ({
	key: `dir_${name.split("/", 1)[0] ?? name}`,
	name: name.replace(/^(\/*)/, "").split("/", 1)[0] ?? name,
	mode: "drwxr-xr-x",
	modeBits: "0755",
	size: 0,
	isFile: false,
	isSymlink: false,
	mimetype: "",
	createdAt: new Date(),
	modifiedAt: new Date(),
	isArchiveType: () => false,
	isEditable: () => false,
});

const NewDirectoryDialog = asDialog({
	title: "Create Directory",
})(() => {
	const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
	const directory = ServerContext.useStoreState(
		(state) => state.files.directory,
	);

	const { mutate } = useFileManagerSwr();
	const { close } = useContext(DialogWrapperContext);
	const { clearAndAddHttpError } = useFlashKey("files:directory-modal");

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		watch,
		reset,
	} = useForm<Values>({
		resolver: zodResolver(schema),
		defaultValues: {
			directoryName: "",
		},
	});

	const directoryName = watch("directoryName");

	useEffect(() => {
		return () => {
			clearAndAddHttpError();
		};
	}, [clearAndAddHttpError]);

	const onSubmit = ({ directoryName }: Values) => {
		createDirectory(uuid, directory, directoryName)
			.then(() =>
				mutate(
					(data) => [...(data || []), generateDirectoryData(directoryName)],
					false,
				),
			)
			.then(() => {
				reset();
				close();
			})
			.catch((error) => {
				clearAndAddHttpError(error);
			});
	};

	return (
		<form css={tw`m-0`} onSubmit={handleSubmit(onSubmit)}>
			<FlashMessageRender key={"files:directory-modal"} />
			<FormField
				autoFocus
				id={"directoryName"}
				label={"Name"}
				{...register("directoryName")}
				error={errors.directoryName?.message}
			/>
			<p css={tw`mt-2 text-sm md:text-base break-all`}>
				<span css={tw`text-neutral-200`}>
					This directory will be created as&nbsp;
				</span>
				<Code>
					/home/container/
					<span css={tw`text-cyan-200`}>
						{join(directory, directoryName || "").replace(/^(\.\.\/|\/)+/, "")}
					</span>
				</Code>
			</p>
			<Dialog.Footer>
				<Button.Text
					className={"w-full sm:w-auto"}
					onClick={close}
					type={"button"}
				>
					Cancel
				</Button.Text>
				<Button
					className={"w-full sm:w-auto"}
					type={"submit"}
					disabled={isSubmitting}
				>
					Create
				</Button>
			</Dialog.Footer>
		</form>
	);
});

export default ({ className }: WithClassname) => {
	const [open, setOpen] = useState(false);

	return (
		<>
			<NewDirectoryDialog open={open} onClose={() => setOpen(false)} />
			<Button onClick={() => setOpen(true)} className={className}>
				<span>Create Directory</span>
			</Button>
		</>
	);
};
