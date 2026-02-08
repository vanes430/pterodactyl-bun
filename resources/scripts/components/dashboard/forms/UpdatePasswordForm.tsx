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
import updateAccountPassword from "@/api/account/updateAccountPassword";
import { httpErrorToHuman } from "@/api/http";
import { Button } from "@/components/elements/button/index";
import FormField from "@/components/elements/FormField";
import SpinnerOverlay from "@/components/elements/SpinnerOverlay";
import type { ApplicationStore } from "@/state";

interface Values {
	current: string;
	password: string;
	confirmPassword: string;
}

const schema = z
	.object({
		current: z.string().min(1, "You must provide your current password."),
		password: z
			.string()
			.min(8, "Your new password should be at least 8 characters in length."),
		confirmPassword: z.string().min(1, "You must confirm your new password."),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Password confirmation does not match the password you entered.",
		path: ["confirmPassword"],
	});

export default () => {
	const user = useStoreState(
		(state: State<ApplicationStore>) => state.user.data,
	);
	const { clearFlashes, addFlash } = useStoreActions(
		(actions: Actions<ApplicationStore>) => actions.flashes,
	);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isValid },
	} = useForm<Values>({
		resolver: zodResolver(schema),
		mode: "onChange",
	});

	if (!user) {
		return null;
	}

	const onSubmit = (values: Values) => {
		clearFlashes("account:password");
		return updateAccountPassword({ ...values })
			.then(() => {
				// @ts-expect-error this is valid
				window.location = "/auth/login";
			})
			.catch((error) =>
				addFlash({
					key: "account:password",
					type: "error",
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
					id={"current_password"}
					type={"password"}
					label={"Current Password"}
					{...register("current")}
					error={errors.current?.message}
				/>
				<div css={tw`mt-6`}>
					<FormField
						id={"new_password"}
						type={"password"}
						label={"New Password"}
						description={
							"Your new password should be at least 8 characters in length and unique to this website."
						}
						{...register("password")}
						error={errors.password?.message}
					/>
				</div>
				<div css={tw`mt-6`}>
					<FormField
						id={"confirm_new_password"}
						type={"password"}
						label={"Confirm New Password"}
						{...register("confirmPassword")}
						error={errors.confirmPassword?.message}
					/>
				</div>
				<div css={tw`mt-6`}>
					<Button disabled={isSubmitting || !isValid}>Update Password</Button>
				</div>
			</form>
		</React.Fragment>
	);
};
