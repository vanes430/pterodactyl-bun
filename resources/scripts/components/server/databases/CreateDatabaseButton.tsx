import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import tw from "twin.macro";
import { z } from "zod";
import { httpErrorToHuman } from "@/api/http";
import createServerDatabase from "@/api/server/databases/createServerDatabase";
import Button from "@/components/elements/Button";
import FormField from "@/components/elements/FormField";
import Modal from "@/components/elements/Modal";
import FlashMessageRender from "@/components/FlashMessageRender";
import useFlash from "@/plugins/useFlash";
import { ServerContext } from "@/state/server";

const schema = z.object({
	databaseName: z
		.string()
		.min(3, "Database name must be at least 3 characters.")
		.max(48, "Database name must not exceed 48 characters.")
		.regex(
			/^[\w\-.]{3,48}$/,
			"Database name should only contain alphanumeric characters, underscores, dashes, and/or periods.",
		),
	connectionsFrom: z
		.string()
		.regex(/^[\w\-/.%:]*$/, "A valid host address must be provided.")
		.optional(),
});

type Values = z.infer<typeof schema>;

export default () => {
	const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
	const { addError, clearFlashes } = useFlash();
	const [visible, setVisible] = useState(false);

	const appendDatabase = ServerContext.useStoreActions(
		(actions) => actions.databases.appendDatabase,
	);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<Values>({
		resolver: zodResolver(schema),
		defaultValues: {
			databaseName: "",
			connectionsFrom: "",
		},
	});

	const onSubmit = (values: Values) => {
		if (!uuid) return;

		clearFlashes("database:create");
		createServerDatabase(uuid, {
			databaseName: values.databaseName,
			connectionsFrom: values.connectionsFrom || "%",
		})
			.then((database) => {
				appendDatabase(database);
				setVisible(false);
				reset();
			})
			.catch((error) => {
				addError({ key: "database:create", message: httpErrorToHuman(error) });
			});
	};

	return (
		<>
			<Modal
				visible={visible}
				dismissable={!isSubmitting}
				showSpinnerOverlay={isSubmitting}
				onDismissed={() => {
					reset();
					setVisible(false);
				}}
			>
				<FlashMessageRender byKey={"database:create"} css={tw`mb-6`} />
				<h2 css={tw`text-2xl mb-6`}>Create new database</h2>
				<form css={tw`m-0`} onSubmit={handleSubmit(onSubmit)}>
					<FormField
						id={"database_name"}
						{...register("databaseName")}
						label={"Database Name"}
						description={"A descriptive name for your database instance."}
						error={errors.databaseName?.message}
					/>
					<div css={tw`mt-6`}>
						<FormField
							id={"connections_from"}
							{...register("connectionsFrom")}
							label={"Connections From"}
							description={
								"Where connections should be allowed from. Leave blank to allow connections from anywhere."
							}
							error={errors.connectionsFrom?.message}
						/>
					</div>
					<div css={tw`flex flex-wrap justify-end mt-6`}>
						<Button
							type={"button"}
							isSecondary
							css={tw`w-full sm:w-auto sm:mr-2`}
							onClick={() => setVisible(false)}
						>
							Cancel
						</Button>
						<Button css={tw`w-full mt-4 sm:w-auto sm:mt-0`} type={"submit"}>
							Create Database
						</Button>
					</div>
				</form>
			</Modal>
			<Button onClick={() => setVisible(true)}>New Database</Button>
		</>
	);
};
