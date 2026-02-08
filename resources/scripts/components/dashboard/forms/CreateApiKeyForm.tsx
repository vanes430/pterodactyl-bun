import { type Actions, useStoreActions } from "easy-peasy";
import { Field, Form, Formik, type FormikHelpers } from "formik";
import { useState } from "react";
import styled from "styled-components/macro";
import tw from "twin.macro";
import { z } from "zod";
import createApiKey from "@/api/account/createApiKey";
import type { ApiKey } from "@/api/account/getApiKeys";
import { httpErrorToHuman } from "@/api/http";
import ApiKeyModal from "@/components/dashboard/ApiKeyModal";
import Button from "@/components/elements/Button";
import FormikFieldWrapper from "@/components/elements/FormikFieldWrapper";
import Input, { Textarea } from "@/components/elements/Input";
import SpinnerOverlay from "@/components/elements/SpinnerOverlay";
import type { ApplicationStore } from "@/state";

interface Values {
	description: string;
	allowedIps: string;
}

const schema = z.object({
	description: z
		.string()
		.min(4, "A description of at least 4 characters must be provided."),
	allowedIps: z.string().optional(),
});

const CustomTextarea = styled(Textarea)`
    ${tw`h-32`}
`;

export default ({ onKeyCreated }: { onKeyCreated: (key: ApiKey) => void }) => {
	const [apiKey, setApiKey] = useState("");
	const { addError, clearFlashes } = useStoreActions(
		(actions: Actions<ApplicationStore>) => actions.flashes,
	);

	const submit = (
		values: Values,
		{ setSubmitting, resetForm }: FormikHelpers<Values>,
	) => {
		clearFlashes("account");
		createApiKey(values.description, values.allowedIps)
			.then(({ secretToken, ...key }) => {
				resetForm();
				setSubmitting(false);
				setApiKey(`${key.identifier}${secretToken}`);
				onKeyCreated(key);
			})
			.catch((error) => {
				console.error(error);

				addError({ key: "account", message: httpErrorToHuman(error) });
				setSubmitting(false);
			});
	};

	return (
		<>
			<ApiKeyModal
				visible={apiKey.length > 0}
				onModalDismissed={() => setApiKey("")}
				apiKey={apiKey}
			/>
			<Formik
				onSubmit={submit}
				initialValues={{ description: "", allowedIps: "" }}
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
							label={"Description"}
							name={"description"}
							description={"A description of this API key."}
							css={tw`mb-6`}
						>
							<Field name={"description"} as={Input} />
						</FormikFieldWrapper>
						<FormikFieldWrapper
							label={"Allowed IPs"}
							name={"allowedIps"}
							description={
								"Leave blank to allow any IP address to use this API key, otherwise provide each IP address on a new line."
							}
						>
							<Field name={"allowedIps"} as={CustomTextarea} />
						</FormikFieldWrapper>
						<div css={tw`flex justify-end mt-6`}>
							<Button>Create</Button>
						</div>
					</Form>
				)}
			</Formik>
		</>
	);
};
