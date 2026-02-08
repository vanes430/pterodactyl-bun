import { zodResolver } from "@hookform/resolvers/zod";
import { join } from "pathe";
import { useForm } from "react-hook-form";
import tw from "twin.macro";
import { z } from "zod";
import Button from "@/components/elements/Button";
import FormField from "@/components/elements/FormField";
import Modal, { type RequiredModalProps } from "@/components/elements/Modal";
import { ServerContext } from "@/state/server";

type Props = RequiredModalProps & {
	onFileNamed: (name: string) => void;
};

const schema = z.object({
	fileName: z.string().min(1, "A file name must be provided."),
});

type Values = z.infer<typeof schema>;

export default ({ onFileNamed, onDismissed, ...props }: Props) => {
	const directory = ServerContext.useStoreState(
		(state) => state.files.directory,
	);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<Values>({
		resolver: zodResolver(schema),
		defaultValues: {
			fileName: "",
		},
	});

	const onSubmit = (values: Values) => {
		onFileNamed(join(directory, values.fileName));
		reset();
	};

	return (
		<Modal
			onDismissed={() => {
				reset();
				onDismissed();
			}}
			{...props}
		>
			<form onSubmit={handleSubmit(onSubmit)}>
				<FormField
					id={"fileName"}
					label={"File Name"}
					description={"Enter the name that this file should be saved as."}
					autoFocus
					{...register("fileName")}
					error={errors.fileName?.message}
				/>
				<div css={tw`mt-6 text-right`}>
					<Button type={"submit"}>Create File</Button>
				</div>
			</form>
		</Modal>
	);
};
