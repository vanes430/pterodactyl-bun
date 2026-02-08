import { zodResolver } from "@hookform/resolvers/zod";
import { useStoreState } from "easy-peasy";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import Reaptcha from "reaptcha";
import tw from "twin.macro";
import { z } from "zod";
import login from "@/api/auth/login";
import LoginFormContainer from "@/components/auth/LoginFormContainer";
import Button from "@/components/elements/Button";
import FormField from "@/components/elements/FormField";
import useFlash from "@/plugins/useFlash";

const schema = z.object({
	username: z.string().min(1, "A username or email must be provided."),
	password: z.string().min(1, "Please enter your account password."),
});

type Values = z.infer<typeof schema>;

const LoginContainer = () => {
	const ref = useRef<Reaptcha>(null);
	const [token, setToken] = useState("");
	const navigate = useNavigate();

	const { clearFlashes, clearAndAddHttpError } = useFlash();
	const recaptcha = useStoreState((state) => state.settings.data?.recaptcha);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		getValues,
	} = useForm<Values>({
		resolver: zodResolver(schema),
		defaultValues: {
			username: "",
			password: "",
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
		if (recaptcha?.enabled && !t) {
			ref.current?.execute().catch((error) => {
				console.error(error);
				clearAndAddHttpError({ error });
			});

			return;
		}

		login({
			username: String(values.username),
			password: String(values.password),
			recaptchaData: t,
		})
			.then((response) => {
				if (response.complete) {
					// @ts-expect-error this is valid
					window.location = response.intended || "/";
					return;
				}

				navigate("/auth/login/checkpoint", {
					state: { token: response.confirmationToken },
					replace: true,
				});
			})
			.catch((error) => {
				console.error(error);

				setToken("");
				if (ref.current) ref.current.reset();
				clearAndAddHttpError({
					error: error instanceof Error ? error : new Error(String(error)),
				});
			});
	};

	return (
		<>
			<LoginFormContainer
				title={"Login to Continue"}
				css={tw`w-full flex`}
				onSubmit={handleSubmit(onSubmit)}
			>
				<FormField
					id={"username"}
					type={"text"}
					label={"Username or Email"}
					{...register("username")}
					disabled={isSubmitting}
					error={errors.username?.message}
				/>
				<div css={tw`mt-6`}>
					<FormField
						id={"password"}
						type={"password"}
						label={"Password"}
						{...register("password")}
						disabled={isSubmitting}
						error={errors.password?.message}
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
				<div css={tw`mt-6 text-center`}>
					<Link
						to={"/auth/password"}
						css={tw`text-xs text-neutral-500 tracking-wide no-underline uppercase hover:text-neutral-600`}
					>
						Forgot password?
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

export default LoginContainer;
