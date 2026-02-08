import { zodResolver } from "@hookform/resolvers/zod";
import { type Actions, useStoreActions } from "easy-peasy";
import { useState } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import tw from "twin.macro";
import { z } from "zod";
import createApiKey from "@/api/account/createApiKey";
import type { ApiKey } from "@/api/account/getApiKeys";
import { httpErrorToHuman } from "@/api/http";
import ApiKeyModal from "@/components/dashboard/ApiKeyModal";
import Button from "@/components/elements/Button";
import FormField from "@/components/elements/FormField";
import { Textarea } from "@/components/elements/Input";
import SpinnerOverlay from "@/components/elements/SpinnerOverlay";
import type { ApplicationStore } from "@/state";

const schema = z.object({
	description: z
		.string()
		.min(4, "A description of at least 4 characters must be provided."),
	allowedIps: z.string(),
});

type Values = z.infer<typeof schema>;

const CustomTextarea = styled(Textarea)`
    ${tw`h-32`}
`;

export default ({ onKeyCreated }: { onKeyCreated: (key: ApiKey) => void }) => {
	const [apiKey, setApiKey] = useState("");
	const { addError, clearFlashes } = useStoreActions(
		(actions: Actions<ApplicationStore>) => actions.flashes,
	);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<Values>({
		resolver: zodResolver(schema),
		defaultValues: {
			description: "",
			allowedIps: "",
		},
	});

	const onSubmit = (values: Values) => {
		clearFlashes("account");
		createApiKey(values.description, values.allowedIps)
			.then(({ secretToken, ...key }) => {
				reset();
				setApiKey(`${key.identifier}${secretToken}`);
				onKeyCreated(key);
			})
			.catch((error) => {
				console.error(error);
				addError({ key: "account", message: httpErrorToHuman(error) });
			});
	};

	return (
		<>
			<ApiKeyModal
				visible={apiKey.length > 0}
				onModalDismissed={() => setApiKey("")}
				apiKey={apiKey}
			/>
			<form onSubmit={handleSubmit(onSubmit)}>
				<SpinnerOverlay visible={isSubmitting} />
				<FormField
					id={"description"}
					label={"Description"}
					description={"A description of this API key."}
					{...register("description")}
					error={errors.description?.message}
					css={tw`mb-6`}
				/>
				<FormField
					id={"allowedIps"}
					label={"Allowed IPs"}
					description={
						"Leave blank to allow any IP address to use this API key, otherwise provide each IP address on a new line."
					}
					as={CustomTextarea}
					{...register("allowedIps")}
					error={errors.allowedIps?.message}
				/>
				<div css={tw`flex justify-end mt-6`}>
					<Button type={"submit"} disabled={isSubmitting}>
						Create
					</Button>
				</div>
			</form>
		</>
	);
};
