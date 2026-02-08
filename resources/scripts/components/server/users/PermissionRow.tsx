import type { UseFormRegisterReturn } from "react-hook-form";
import styled from "styled-components";
import tw from "twin.macro";
import CustomCheckbox from "@/components/elements/CustomCheckbox";
import Label from "@/components/elements/Label";

const Container = styled.label`
    ${tw`flex items-center border border-transparent rounded md:p-2 transition-colors duration-75`};
    text-transform: none;

    &:not(.disabled) {
        ${tw`cursor-pointer`};

        &:hover {
            ${tw`border-neutral-500 bg-neutral-800`};
        }
    }

    &:not(:first-of-type) {
        ${tw`mt-4 sm:mt-2`};
    }

    &.disabled {
        ${tw`opacity-50`};

        & input[type='checkbox']:not(:checked) {
            ${tw`border-0`};
        }
    }
`;

interface Props {
	permission: string;
	disabled: boolean;
	register: UseFormRegisterReturn;
	checked: boolean;
	description?: string;
}

const PermissionRow = ({
	permission,
	disabled,
	register,
	checked,
	description,
}: Props) => {
	const [, pkey] = permission.split(".", 2);

	return (
		<Container
			htmlFor={`permission_${permission}`}
			className={disabled ? "disabled" : undefined}
		>
			<div css={tw`p-2`}>
				<CustomCheckbox
					id={`permission_${permission}`}
					value={permission}
					css={tw`w-5 h-5 mr-2`}
					disabled={disabled}
					checked={checked}
					{...register}
				/>
			</div>
			<div css={tw`flex-1`}>
				<Label as={"p"} css={tw`font-medium`}>
					{pkey}
				</Label>
				{description && description.length > 0 && (
					<p css={tw`text-xs text-neutral-400 mt-1`}>{description}</p>
				)}
			</div>
		</Container>
	);
};

export default PermissionRow;
