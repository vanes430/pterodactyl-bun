import { Form, Formik, type FormikHelpers } from "formik";
import { join } from "pathe";
import tw from "twin.macro";
import { z } from "zod";
import Button from "@/components/elements/Button";
import Field from "@/components/elements/Field";
import Modal, { type RequiredModalProps } from "@/components/elements/Modal";
import { ServerContext } from "@/state/server";

type Props = RequiredModalProps & {
	onFileNamed: (name: string) => void;
};

interface Values {
	fileName: string;
}

const schema = z.object({
	fileName: z.string().min(1, "A file name must be provided."),
});

export default ({ onFileNamed, onDismissed, ...props }: Props) => {
	const directory = ServerContext.useStoreState(
		(state) => state.files.directory,
	);

	const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
		onFileNamed(join(directory, values.fileName));
		setSubmitting(false);
	};

	return (
		<Formik
			onSubmit={submit}
			initialValues={{ fileName: "" }}
			validate={(values) => {
				const result = schema.safeParse(values);
				if (result.success) return {};

				const errors: Record<string, string> = {};
				for (const error of result.error.issues) {
					errors[error.path[0] as string] = error.message;
				}
				return errors;
			}}
		>
			{({ resetForm }) => (
				<Modal
					onDismissed={() => {
						resetForm();
						onDismissed();
					}}
					{...props}
				>
					<Form>
						<Field
							id={"fileName"}
							name={"fileName"}
							label={"File Name"}
							description={"Enter the name that this file should be saved as."}
							autoFocus
						/>
						<div css={tw`mt-6 text-right`}>
							<Button>Create File</Button>
						</div>
					</Form>
				</Modal>
			)}
		</Formik>
	);
};
