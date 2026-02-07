import type React from "react";
import { useMemo } from "react";
import styled from "styled-components/macro";
import tw from "twin.macro";
import { v4 } from "uuid";
import Input from "@/components/elements/Input";
import Label from "@/components/elements/Label";

const ToggleContainer = styled.div`
    ${tw`relative select-none w-12 leading-normal`};

    & > input[type='checkbox'] {
        ${tw`hidden`};

        &:checked + label {
            ${tw`bg-cyan-500/20 border-cyan-500/50 shadow-none`};
        }

        &:checked + label:before {
            ${tw`bg-cyan-400 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]`};
            right: 0.125rem;
        }
    }

    & > label {
        ${tw`mb-0 block overflow-hidden cursor-pointer bg-white/5 border border-white/10 rounded-full h-6 shadow-inner transition-all duration-200`};

        &::before {
            ${tw`absolute block bg-neutral-400 border border-transparent h-5 w-5 rounded-full`};
            top: 0.125rem;
            right: calc(50% + 0.125rem);
            content: '';
            transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
        }
    }
`;

export interface SwitchProps {
	name: string;
	label?: string;
	description?: string;
	defaultChecked?: boolean;
	readOnly?: boolean;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	children?: React.ReactNode;
}

const Switch = ({
	name,
	label,
	description,
	defaultChecked,
	readOnly,
	onChange,
	children,
}: SwitchProps) => {
	const uuid = useMemo(() => v4(), []);

	return (
		<div css={tw`flex items-center`}>
			<ToggleContainer css={tw`flex-none`}>
				{children || (
					<Input
						id={uuid}
						name={name}
						type={"checkbox"}
						onChange={(e) => onChange?.(e)}
						defaultChecked={defaultChecked}
						disabled={readOnly}
					/>
				)}
				<Label htmlFor={uuid} />
			</ToggleContainer>
			{(label || description) && (
				<div css={tw`ml-4 w-full`}>
					{label && (
						<Label
							css={[tw`cursor-pointer`, !!description && tw`mb-0`]}
							htmlFor={uuid}
						>
							{label}
						</Label>
					)}
					{description && (
						<p css={tw`text-neutral-400 text-sm mt-2`}>{description}</p>
					)}
				</div>
			)}
		</div>
	);
};

export default Switch;
