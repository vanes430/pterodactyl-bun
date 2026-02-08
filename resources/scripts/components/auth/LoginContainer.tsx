import { useStoreState } from "easy-peasy";
import { Formik, type FormikHelpers } from "formik";
import { useEffect, useRef, useState } from "react";
import { Link, type RouteComponentProps } from "react-router-dom";
import Reaptcha from "reaptcha";
import tw from "twin.macro";
import { z } from "zod";
import login from "@/api/auth/login";
import LoginFormContainer from "@/components/auth/LoginFormContainer";
import Button from "@/components/elements/Button";
import Field from "@/components/elements/Field";
import useFlash from "@/plugins/useFlash";

interface Values {
	username: string;
	password: string;
}

const schema = z.object({
	username: z.string().min(1, "A username or email must be provided."),
	password: z.string().min(1, "Please enter your account password."),
});

const LoginContainer = ({ history }: RouteComponentProps) => {
	const ref = useRef<Reaptcha>(null);
	const [token, setToken] = useState("");

	const { clearFlashes, clearAndAddHttpError } = useFlash();
	const recaptcha = useStoreState((state) => state.settings.data?.recaptcha);

	useEffect(() => {
		clearFlashes(undefined);
	}, [clearFlashes]);

	const onSubmit = (
		values: Values,
		{ setSubmitting }: FormikHelpers<Values>,
	) => {
		clearFlashes(undefined);

		// If there is no token in the state yet, request the token and then abort this submit request
		// since it will be re-submitted when the recaptcha data is returned by the component.
		if (recaptcha?.enabled && !token) {
			ref.current?.execute().catch((error) => {
				console.error(error);

				setSubmitting(false);
				clearAndAddHttpError({ error });
			});

			return;
		}

		login({ ...values, recaptchaData: token })
			.then((response) => {
				if (response.complete) {
					// @ts-expect-error this is valid
					window.location = response.intended || "/";
					return;
				}

				history.replace("/auth/login/checkpoint", {
					token: response.confirmationToken,
				});
			})
			.catch((error) => {
				console.error(error);

				setToken("");
				if (ref.current) ref.current.reset();

				setSubmitting(false);
				clearAndAddHttpError({ error });
			});
	};

	return (
		<Formik
			onSubmit={onSubmit}
			initialValues={{ username: "", password: "" }}
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
			{({ isSubmitting, setSubmitting, submitForm }) => (
				<LoginFormContainer title={"Login to Continue"} css={tw`w-full flex`}>
					<Field
						light
						type={"text"}
						label={"Username or Email"}
						name={"username"}
						disabled={isSubmitting}
					/>
					<div css={tw`mt-6`}>
						<Field
							light
							type={"password"}
							label={"Password"}
							name={"password"}
							disabled={isSubmitting}
						/>
					</div>
					<div css={tw`mt-6`}>
						<Button
							type={"submit"}
							size={"xlarge"}
							isLoading={isSubmitting}
							disabled={isSubmitting}
						>
							Login
						</Button>
					</div>
					{recaptcha?.enabled && (
						<Reaptcha
							ref={ref}
							size={"invisible"}
							sitekey={recaptcha.siteKey || "_invalid_key"}
							onVerify={(response) => {
								setToken(response);
								submitForm();
							}}
							onExpire={() => {
								setSubmitting(false);
								setToken("");
							}}
						/>
					)}
					<div css={tw`mt-6 text-center`}>
						<Link
							to={"/auth/password"}
							css={tw`text-xs text-neutral-500 tracking-wide no-underline uppercase hover:text-neutral-600`}
						>
							Forgot password?
						</Link>
					</div>
				</LoginFormContainer>
			)}
		</Formik>
	);
};

export default LoginContainer;
