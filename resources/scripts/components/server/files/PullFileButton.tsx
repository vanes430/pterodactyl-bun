import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import pullFile from "@/api/server/files/pullFile";
import { Button } from "@/components/elements/button/index";
import { Dialog, DialogWrapperContext } from "@/components/elements/dialog";
import FormField from "@/components/elements/FormField";
import FlashMessageRender from "@/components/FlashMessageRender";
import type { WithClassname } from "@/components/types";
import asDialog from "@/hoc/asDialog";
import useFileManagerSwr from "@/plugins/useFileManagerSwr";
import { useFlashKey } from "@/plugins/useFlash";
import { ServerContext } from "@/state/server";

const schema = z.object({
	url: z.string().url("A valid URL must be provided."),
});

type Values = z.infer<typeof schema>;

const PullFileDialog = asDialog({
	title: "Download from URL",
})(() => {
	const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
	const directory = ServerContext.useStoreState(
		(state) => state.files.directory,
	);

	const { mutate } = useFileManagerSwr();
	const { close } = useContext(DialogWrapperContext);
	const { clearAndAddHttpError } = useFlashKey("files:pull-modal");

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<Values>({
		resolver: zodResolver(schema),
		defaultValues: {
			url: "",
		},
	});

	useEffect(() => {
		return () => {
			clearAndAddHttpError();
		};
	}, [clearAndAddHttpError]);

	const onSubmit = ({ url }: Values) => {
		pullFile(uuid, directory, url)
			.then(() => mutate())
			.then(() => {
				reset();
				close();
			})
			.catch((error) => {
				clearAndAddHttpError(error);
			});
	};

	return (
		<form className={"m-0"} onSubmit={handleSubmit(onSubmit)}>
			<FlashMessageRender key={"files:pull-modal"} />
			<FormField
				autoFocus
				id={"url"}
				label={"File URL"}
				description={
					"Enter the direct URL of the file you want to download to this directory."
				}
				{...register("url")}
				error={errors.url?.message}
			/>
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
					Download
				</Button>
			</Dialog.Footer>
		</form>
	);
});

export default ({ className }: WithClassname) => {
	const [open, setOpen] = useState(false);

	return (
		<>
			<PullFileDialog open={open} onClose={() => setOpen(false)} />
			<Button onClick={() => setOpen(true)} className={className}>
				<span>Download</span>
			</Button>
		</>
	);
};
