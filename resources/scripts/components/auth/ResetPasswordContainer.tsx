import { zodResolver } from "@hookform/resolvers/zod";
import { type Actions, useStoreActions } from "easy-peasy";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useParams } from "react-router-dom";
import tw from "twin.macro";
import { z } from "zod";
import performPasswordReset from "@/api/auth/performPasswordReset";
import { httpErrorToHuman } from "@/api/http";
import LoginFormContainer from "@/components/auth/LoginFormContainer";
import Button from "@/components/elements/Button";
import FormField from "@/components/elements/FormField";
import Input from "@/components/elements/Input";
import Label from "@/components/elements/Label";
import type { ApplicationStore } from "@/state";

const schema = z
	.object({
		password: z
			.string()
			.min(8, "Your new password should be at least 8 characters in length."),
		passwordConfirmation: z
			.string()
			.min(1, "Your new password does not match."),
	})
	.refine((data) => data.password === data.passwordConfirmation, {
		message: "Your new password does not match.",
		path: ["passwordConfirmation"],
	});

type Values = z.infer<typeof schema>;

export default () => {
	const { token } = useParams<{ token: string }>();
	const location = useLocation();
	const [email, setEmail] = useState("");

	const { clearFlashes, addFlash } = useStoreActions(
		(actions: Actions<ApplicationStore>) => actions.flashes,
	);

	const parsed = new URLSearchParams(location.search);
	if (email.length === 0 && parsed.get("email")) {
		setEmail(parsed.get("email") || "");
	}

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<Values>({
		resolver: zodResolver(schema),
		defaultValues: {
			password: "",
			passwordConfirmation: "",
		},
	});

	const onSubmit = ({ password, passwordConfirmation }: Values) => {
		clearFlashes(undefined);
		performPasswordReset(email, {
			token: token || "",
			password,
			passwordConfirmation,
		})
			.then(() => {
				// @ts-expect-error this is valid
				window.location = "/";
			})
			.catch((error) => {
				console.error(error);
				addFlash({
					type: "error",
					title: "Error",
					message: httpErrorToHuman(error),
				});
			});
	};

	return (
		<LoginFormContainer
			title={"Reset Password"}
			css={tw`w-full flex`}
			onSubmit={handleSubmit(onSubmit)}
		>
			<div>
				<Label isLight>Email</Label>
				<Input value={email} isLight disabled />
			</div>
			<div css={tw`mt-6`}>
				<FormField
					id={"password"}
					light
					label={"New Password"}
					{...register("password")}
					type={"password"}
					description={"Passwords must be at least 8 characters in length."}
					error={errors.password?.message}
				/>
			</div>
			<div css={tw`mt-6`}>
				<FormField
					id={"passwordConfirmation"}
					light
					label={"Confirm New Password"}
					{...register("passwordConfirmation")}
					type={"password"}
					error={errors.passwordConfirmation?.message}
				/>
			</div>
			<div css={tw`mt-6`}>
				<Button
					size={"xlarge"}
					type={"submit"}
					disabled={isSubmitting}
					isLoading={isSubmitting}
				>
					Reset Password
				</Button>
			</div>
			<div css={tw`mt-6 text-center`}>
				<Link
					to={"/auth/login"}
					css={tw`text-xs text-neutral-500 tracking-wide no-underline uppercase hover:text-neutral-600`}
				>
					Return to Login
				</Link>
			</div>
		</LoginFormContainer>
	);
};
