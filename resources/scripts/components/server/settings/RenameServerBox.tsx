import { zodResolver } from "@hookform/resolvers/zod";
import { type Actions, useStoreActions } from "easy-peasy";
import { useForm } from "react-hook-form";
import tw from "twin.macro";
import { z } from "zod";
import { httpErrorToHuman } from "@/api/http";
import renameServer from "@/api/server/renameServer";
import { Button } from "@/components/elements/button/index";
import FormField from "@/components/elements/FormField";
import { Textarea } from "@/components/elements/Input";
import SpinnerOverlay from "@/components/elements/SpinnerOverlay";
import TitledGreyBox from "@/components/elements/TitledGreyBox";
import type { ApplicationStore } from "@/state";
import { ServerContext } from "@/state/server";

const schema = z.object({
	name: z.string().min(1, "A server name must be provided."),
	description: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export default () => {
	const server = ServerContext.useStoreState((state) => state.server.data!);
	const setServer = ServerContext.useStoreActions(
		(actions) => actions.server.setServer,
	);
	const { addError, clearFlashes } = useStoreActions(
		(actions: Actions<ApplicationStore>) => actions.flashes,
	);

	const {
		register,
		handleSubmit,
		formState: { isSubmitting, errors },
	} = useForm<Values>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: server.name,
			description: server.description,
		},
	});

	const onSubmit = ({ name, description }: Values) => {
		clearFlashes("settings");
		renameServer(server.uuid, name, description)
			.then(() => setServer({ ...server, name, description }))
			.catch((error) => {
				console.error(error);
				addError({ key: "settings", message: httpErrorToHuman(error) });
			});
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<TitledGreyBox title={"Change Server Details"} css={tw`relative`}>
				<SpinnerOverlay visible={isSubmitting} />
				<div css={tw`mb-0`}>
					<FormField
						id={"name"}
						label={"Server Name"}
						type={"text"}
						{...register("name")}
						error={errors.name?.message}
					/>
					<div css={tw`mt-6`}>
						<FormField
							id={"description"}
							label={"Server Description"}
							as={Textarea}
							rows={3}
							{...register("description")}
							error={errors.description?.message}
						/>
					</div>
					<div css={tw`mt-6 text-right`}>
						<Button type={"submit"}>Save</Button>
					</div>
				</div>
			</TitledGreyBox>
		</form>
	);
};
