import { zodResolver } from "@hookform/resolvers/zod";
import { useStoreState } from "easy-peasy";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import Reaptcha from "reaptcha";
import tw from "twin.macro";
import { z } from "zod";
import requestPasswordResetEmail from "@/api/auth/requestPasswordResetEmail";
import { httpErrorToHuman } from "@/api/http";
import LoginFormContainer from "@/components/auth/LoginFormContainer";
import Button from "@/components/elements/Button";
import FormField from "@/components/elements/FormField";
import useFlash from "@/plugins/useFlash";

const schema = z.object({
	email: z
		.string()
		.min(1, "A valid email address must be provided to continue.")
		.email("A valid email address must be provided to continue."),
});

type Values = z.infer<typeof schema>;

export default () => {
	const ref = useRef<Reaptcha>(null);
	const [token, setToken] = useState("");

	const { clearFlashes, addFlash } = useFlash();
	const recaptcha = useStoreState((state) => state.settings.data?.recaptcha);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
		getValues,
	} = useForm<Values>({
		resolver: zodResolver(schema),
		defaultValues: {
			email: "",
		},
	});

	useEffect(() => {
		clearFlashes(undefined);
	}, [clearFlashes]);

	const onSubmit = (
		values: Values,
		recaptchaTokenOrEvent?: string | React.BaseSyntheticEvent,
	) => {
		clearFlashes(undefined);

		// Extract the recaptcha token if it's passed as a string, otherwise use the token from state
		const recaptchaToken =
			typeof recaptchaTokenOrEvent === "string"
				? recaptchaTokenOrEvent
				: undefined;
		const t = recaptchaToken || token;
		// If there is no token in the state yet, request the token and then abort this submit request
		// since it will be re-submitted when the recaptcha data is returned by the component.
		if (recaptcha?.enabled && !t) {
			ref.current?.execute().catch((error) => {
				console.error(error);
				addFlash({
					type: "error",
					title: "Error",
					message: httpErrorToHuman(error),
				});
			});

			return;
		}

		requestPasswordResetEmail(values.email, t)
			.then((response) => {
				reset();
				addFlash({ type: "success", title: "Success", message: response });
			})
			.catch((error) => {
				console.error(error);
				addFlash({
					type: "error",
					title: "Error",
					message: httpErrorToHuman(error),
				});
			})
			.finally(() => {
				setToken("");
				if (ref.current) ref.current.reset();
			});
	};

	return (
		<>
			<LoginFormContainer
				title={"Request Password Reset"}
				css={tw`w-full flex`}
				onSubmit={handleSubmit(onSubmit)}
			>
				<FormField
					id={"email"}
					label={"Email"}
					description={
						"Enter your account email address to receive instructions on resetting your password."
					}
					{...register("email")}
					type={"email"}
					error={errors.email?.message}
				/>
				<div css={tw`mt-6`}>
					<Button
						type={"submit"}
						size={"xlarge"}
						disabled={isSubmitting}
						isLoading={isSubmitting}
					>
						Send Email
					</Button>
				</div>
				<div css={tw`mt-6 text-center`}>
					<Link
						to={"/auth/login"}
						css={tw`text-xs text-neutral-500 tracking-wide uppercase no-underline hover:text-neutral-700`}
					>
						Return to Login
					</Link>
				</div>
			</LoginFormContainer>
			{recaptcha?.enabled && (
				<Reaptcha
					ref={ref}
					size={"invisible"}
					sitekey={recaptcha.siteKey || "_invalid_key"}
					onVerify={(response) => {
						setToken(response);
						onSubmit(getValues(), response);
					}}
					onExpire={() => {
						setToken("");
					}}
				/>
			)}
		</>
	);
};
