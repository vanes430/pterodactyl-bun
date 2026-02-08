import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import tw from "twin.macro";
import { z } from "zod";
import { createSSHKey, useSSHKeys } from "@/api/account/ssh-keys";
import Button from "@/components/elements/Button";
import FormField from "@/components/elements/FormField";
import { Textarea } from "@/components/elements/Input";
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

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<Values>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: "",
			publicKey: "",
		},
	});

	const onSubmit = (values: Values) => {
		clearAndAddHttpError();

		createSSHKey(values.name, values.publicKey)
			.then((key) => {
				reset();
				mutate((data) => (data || []).concat(key));
			})
			.catch((error) => clearAndAddHttpError(error));
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<SpinnerOverlay visible={isSubmitting} />
			<FormField
				id={"name"}
				label={"SSH Key Name"}
				{...register("name")}
				error={errors.name?.message}
				css={tw`mb-6`}
			/>
			<FormField
				id={"publicKey"}
				label={"Public Key"}
				description={"Enter your public SSH key."}
				as={CustomTextarea}
				{...register("publicKey")}
				error={errors.publicKey?.message}
			/>
			<div css={tw`flex justify-end mt-6`}>
				<Button type={"submit"} disabled={isSubmitting}>
					Save
				</Button>
			</div>
		</form>
	);
};
