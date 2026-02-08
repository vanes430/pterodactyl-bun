import { type Actions, useStoreActions } from "easy-peasy";
import { Formik, type FormikHelpers } from "formik";
import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import tw from "twin.macro";
import { z } from "zod";
import performPasswordReset from "@/api/auth/performPasswordReset";
import { httpErrorToHuman } from "@/api/http";
import LoginFormContainer from "@/components/auth/LoginFormContainer";
import Button from "@/components/elements/Button";
import Field from "@/components/elements/Field";
import Input from "@/components/elements/Input";
import type { ApplicationStore } from "@/state";

interface Values {
	password: string;
	passwordConfirmation: string;
}

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

	const submit = (
		{ password, passwordConfirmation }: Values,
		{ setSubmitting }: FormikHelpers<Values>,
	) => {
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

				setSubmitting(false);
				addFlash({
					type: "error",
					title: "Error",
					message: httpErrorToHuman(error),
				});
			});
	};

	return (
		<Formik
			onSubmit={submit}
			initialValues={{
				password: "",
				passwordConfirmation: "",
			}}
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
				<LoginFormContainer title={"Reset Password"} css={tw`w-full flex`}>
					<div>
						<label>Email</label>
						<Input value={email} isLight disabled />
					</div>
					<div css={tw`mt-6`}>
						<Field
							light
							label={"New Password"}
							name={"password"}
							type={"password"}
							description={"Passwords must be at least 8 characters in length."}
						/>
					</div>
					<div css={tw`mt-6`}>
						<Field
							light
							label={"Confirm New Password"}
							name={"passwordConfirmation"}
							type={"password"}
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
			)}
		</Formik>
	);
};
