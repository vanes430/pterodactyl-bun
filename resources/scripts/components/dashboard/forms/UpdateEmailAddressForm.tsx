import { zodResolver } from "@hookform/resolvers/zod";
import {
	type Actions,
	type State,
	useStoreActions,
	useStoreState,
} from "easy-peasy";
import React from "react";
import { useForm } from "react-hook-form";
import tw from "twin.macro";
import { z } from "zod";
import { httpErrorToHuman } from "@/api/http";
import { Button } from "@/components/elements/button/index";
import FormField from "@/components/elements/FormField";
import SpinnerOverlay from "@/components/elements/SpinnerOverlay";
import type { ApplicationStore } from "@/state";

interface Values {
	email: string;
	password: string;
}

const schema = z.object({
	email: z.string().email().min(1, "Email is required"),
	password: z
		.string()
		.min(1, "You must provide your current account password."),
});

export default () => {
	const user = useStoreState(
		(state: State<ApplicationStore>) => state.user.data,
	);
	const updateEmail = useStoreActions(
		(state: Actions<ApplicationStore>) => state.user.updateUserEmail,
	);

	const { clearFlashes, addFlash } = useStoreActions(
		(actions: Actions<ApplicationStore>) => actions.flashes,
	);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isValid },
		reset,
	} = useForm<Values>({
		resolver: zodResolver(schema),
		mode: "onChange",
		defaultValues: {
			email: user?.email || "",
			password: "",
		},
	});

	const onSubmit = (values: Values) => {
		clearFlashes("account:email");

		updateEmail({ ...values })
			.then(() => {
				addFlash({
					type: "success",
					key: "account:email",
					message: "Your primary email has been updated.",
				});
				reset({ email: values.email, password: "" });
			})
			.catch((error) =>
				addFlash({
					type: "error",
					key: "account:email",
					title: "Error",
					message: httpErrorToHuman(error),
				}),
			);
	};

	return (
		<React.Fragment>
			<SpinnerOverlay size={"large"} visible={isSubmitting} />
			<form css={tw`m-0`} onSubmit={handleSubmit(onSubmit)}>
				<FormField
					id={"email"}
					type={"email"}
					label={"Email"}
					{...register("email")}
					error={errors.email?.message}
				/>
				<div css={tw`mt-6`}>
					<FormField
						id={"password"}
						type={"password"}
						label={"Confirm Password"}
						{...register("password")}
						error={errors.password?.message}
					/>
				</div>
				<div css={tw`mt-6`}>
					<Button disabled={isSubmitting || !isValid}>Update Email</Button>
				</div>
			</form>
		</React.Fragment>
	);
};
