import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import tw from "twin.macro";
import updateStartupVariable from "@/api/server/updateStartupVariable";
import Button from "@/components/elements/Button";
import FormField from "@/components/elements/FormField";
import Modal from "@/components/elements/Modal";
import FlashMessageRender from "@/components/FlashMessageRender";
import { SocketEvent, SocketRequest } from "@/components/server/events";
import useFlash from "@/plugins/useFlash";
import { ServerContext } from "@/state/server";

interface Values {
	gslToken: string;
}

const GSLTokenModalFeature = () => {
	const [visible, setVisible] = useState(false);
	const [loading, setLoading] = useState(false);

	const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
	const status = ServerContext.useStoreState((state) => state.status.value);
	const { clearFlashes, clearAndAddHttpError } = useFlash();
	const { connected, instance } = ServerContext.useStoreState(
		(state) => state.socket,
	);

	const { register, handleSubmit, reset } = useForm<Values>({
		defaultValues: {
			gslToken: "",
		},
	});

	useEffect(() => {
		if (!connected || !instance || status === "running") return;

		const errors = ["(gsl token expired)", "(account not found)"];

		const listener = (line: string) => {
			if (errors.some((p) => line.toLowerCase().includes(p))) {
				setVisible(true);
			}
		};

		instance.addListener(SocketEvent.CONSOLE_OUTPUT, listener);

		return () => {
			instance.removeListener(SocketEvent.CONSOLE_OUTPUT, listener);
		};
	}, [connected, instance, status]);

	const onSubmit = (values: Values) => {
		setLoading(true);
		clearFlashes("feature:gslToken");

		updateStartupVariable(uuid, "STEAM_ACC", values.gslToken)
			.then(() => {
				if (instance) {
					instance.send(SocketRequest.SET_STATE, "restart");
				}

				setLoading(false);
				setVisible(false);
				reset();
			})
			.catch((error) => {
				console.error(error);
				clearAndAddHttpError({ key: "feature:gslToken", error });
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		clearFlashes("feature:gslToken");
	}, [clearFlashes]);

	return (
		<Modal
			visible={visible}
			onDismissed={() => setVisible(false)}
			closeOnBackground={false}
			showSpinnerOverlay={loading}
		>
			<FlashMessageRender byKey={"feature:gslToken"} css={tw`mb-4`} />
			<form onSubmit={handleSubmit(onSubmit)}>
				<h2 css={tw`text-2xl mb-4 text-neutral-100`}>Invalid GSL token!</h2>
				<p css={tw`mt-4`}>
					It seems like your Gameserver Login Token (GSL token) is invalid or
					has expired.
				</p>
				<p css={tw`mt-4`}>
					You can either generate a new one and enter it below or leave the
					field blank to remove it completely.
				</p>
				<div css={tw`sm:flex items-center mt-4`}>
					<FormField
						id={"gslToken"}
						label={"GSL Token"}
						description={
							"Visit https://steamcommunity.com/dev/managegameservers to generate a token."
						}
						autoFocus
						{...register("gslToken")}
					/>
				</div>
				<div css={tw`mt-8 sm:flex items-center justify-end`}>
					<Button
						type={"submit"}
						css={tw`mt-4 sm:mt-0 sm:ml-4 w-full sm:w-auto`}
					>
						Update GSL Token
					</Button>
				</div>
			</form>
		</Modal>
	);
};

export default GSLTokenModalFeature;
