import { type UseControllerProps, useController } from "react-hook-form";
import Switch, { type SwitchProps } from "@/components/elements/Switch";

interface Props
	extends Omit<SwitchProps, "name" | "defaultChecked" | "onChange">,
		UseControllerProps<any> {}

const FormSwitch = ({ control, name, label, description, ...props }: Props) => {
	const {
		field: { onChange, value, ref },
	} = useController({
		name,
		control,
	});

	return (
		<Switch
			name={name}
			label={label}
			description={description}
			onChange={onChange}
			defaultChecked={value}
			{...props}
		>
			<input
				type={"checkbox"}
				name={name}
				checked={value}
				onChange={onChange}
				ref={ref}
			/>
		</Switch>
	);
};

export default FormSwitch;
