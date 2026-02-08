import { Field, Form, Formik, type FormikHelpers } from "formik";
import styled from "styled-components/macro";
import tw from "twin.macro";
import { z } from "zod";
import { createSSHKey, useSSHKeys } from "@/api/account/ssh-keys";
import Button from "@/components/elements/Button";
import FormikFieldWrapper from "@/components/elements/FormikFieldWrapper";
import Input, { Textarea } from "@/components/elements/Input";
import SpinnerOverlay from "@/components/elements/SpinnerOverlay";
import { useFlashKey } from "@/plugins/useFlash";

interface Values {
	name: string;
	publicKey: string;
}

const schema = z.object({
	name: z.string().min(1, "A name must be provided for this SSH key."),
	publicKey: z.string().min(1, "A public key must be provided."),
});

const CustomTextarea = styled(Textarea)`
    ${tw`h-32`}
`;

export default () => {
	const { clearAndAddHttpError } = useFlashKey("account");
	const { mutate } = useSSHKeys();

	const submit = (
		values: Values,
		{ setSubmitting, resetForm }: FormikHelpers<Values>,
	) => {
		clearAndAddHttpError();

		createSSHKey(values.name, values.publicKey)
			.then((key) => {
				resetForm();
				mutate((data) => (data || []).concat(key));
			})
			.catch((error) => clearAndAddHttpError(error))
			.then(() => setSubmitting(false));
	};

	return (
		<Formik
			onSubmit={submit}
			initialValues={{ name: "", publicKey: "" }}
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
			{({ isSubmitting }) => (
				<Form>
					<SpinnerOverlay visible={isSubmitting} />
					<FormikFieldWrapper
						label={"SSH Key Name"}
						name={"name"}
						css={tw`mb-6`}
					>
						<Field name={"name"} as={Input} />
					</FormikFieldWrapper>
					<FormikFieldWrapper
						label={"Public Key"}
						name={"publicKey"}
						description={"Enter your public SSH key."}
					>
						<Field name={"publicKey"} as={CustomTextarea} />
					</FormikFieldWrapper>
					<div css={tw`flex justify-end mt-6`}>
						<Button>Save</Button>
					</div>
				</Form>
			)}
		</Formik>
	);
};
