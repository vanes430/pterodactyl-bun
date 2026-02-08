import { Form, Formik, type FormikHelpers } from "formik";
import { useContext, useEffect, useState } from "react";
import { z } from "zod";
import pullFile from "@/api/server/files/pullFile";
import { Button } from "@/components/elements/button/index";
import { Dialog, DialogWrapperContext } from "@/components/elements/dialog";
import Field from "@/components/elements/Field";
import FlashMessageRender from "@/components/FlashMessageRender";
import type { WithClassname } from "@/components/types";
import asDialog from "@/hoc/asDialog";
import useFileManagerSwr from "@/plugins/useFileManagerSwr";
import { useFlashKey } from "@/plugins/useFlash";
import { ServerContext } from "@/state/server";

interface Values {
	url: string;
}

const schema = z.object({
	url: z.string().url("A valid URL must be provided."),
});

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

	useEffect(() => {
		return () => {
			clearAndAddHttpError();
		};
	}, [clearAndAddHttpError]);

	const submit = (
		{ url }: Values,
		{ setSubmitting }: FormikHelpers<Values>,
	) => {
		pullFile(uuid, directory, url)
			.then(() => mutate())
			.then(() => close())
			.catch((error) => {
				setSubmitting(false);
				clearAndAddHttpError(error);
			});
	};

	return (
		<Formik
			onSubmit={submit}
			validate={(values) => {
				const result = schema.safeParse(values);
				if (result.success) return {};

				const errors: Record<string, string> = {};
				for (const error of result.error.issues) {
					errors[error.path[0] as string] = error.message;
				}
				return errors;
			}}
			initialValues={{ url: "" }}
		>
			{({ submitForm }) => (
				<>
					<FlashMessageRender key={"files:pull-modal"} />
					<Form className={"m-0"}>
						<Field
							autoFocus
							id={"url"}
							name={"url"}
							label={"File URL"}
							description={
								"Enter the direct URL of the file you want to download to this directory."
							}
						/>
					</Form>
					<Dialog.Footer>
						<Button.Text className={"w-full sm:w-auto"} onClick={close}>
							Cancel
						</Button.Text>
						<Button className={"w-full sm:w-auto"} onClick={submitForm}>
							Download
						</Button>
					</Dialog.Footer>
				</>
			)}
		</Formik>
	);
});

export default ({ className }: WithClassname) => {
	const [open, setOpen] = useState(false);

	return (
		<>
			<PullFileDialog open={open} onClose={setOpen.bind(this, false)} />
			<Button onClick={setOpen.bind(this, true)} className={className}>
				<span>Download</span>
			</Button>
		</>
	);
};
