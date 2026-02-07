import styled, { css } from "styled-components/macro";
import tw from "twin.macro";

export interface Props {
	isLight?: boolean;
	hasError?: boolean;
}

const light = css<Props>`
    ${tw`bg-white border-neutral-200 text-neutral-800`};
    &:focus {
        ${tw`border-primary-400`}
    }

    &:disabled {
        ${tw`bg-neutral-100 border-neutral-200`};
    }
`;

const checkboxStyle = css<Props>`
    ${tw`bg-white/5 cursor-pointer appearance-none inline-block align-middle select-none flex-shrink-0 w-4 h-4 text-cyan-500 border border-white/10 rounded transition-all duration-200`};
    color-adjust: exact;
    background-origin: border-box;

    &:checked {
        ${tw`border-transparent bg-no-repeat bg-center bg-cyan-500/20`};
        background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M5.707 7.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414L7 8.586 5.707 7.293z'/%3e%3c/svg%3e");
        background-size: 100% 100%;
    }

    &:focus {
        ${tw`outline-none border-cyan-400 ring-2 ring-cyan-500 ring-opacity-50`};
    }
`;

const inputStyle = css<Props>`
    // Reset to normal styling.
    resize: none;
    ${tw`appearance-none outline-none w-full min-w-0`};
    ${tw`p-3 border rounded-lg text-sm transition-all duration-200`};
    ${tw`bg-white/[0.03] border-white/10 hover:border-white/20 text-neutral-200 shadow-none focus:ring-0`};

    & + .input-help {
        ${tw`mt-1 text-xs text-neutral-400`};
        ${(props) => props.hasError && tw`text-red-400`};
    }

    &:required,
    &:invalid {
        ${tw`shadow-none`};
    }

    &:not(:disabled):not(:read-only):focus {
        ${tw`bg-white/[0.05] border-cyan-500/50 ring-2 ring-cyan-500/20`};
        ${(props) => props.hasError && tw`border-red-500/50 ring-red-500/20`};
    }

    &:disabled {
        ${tw`opacity-50 cursor-not-allowed`};
    }

    ${(props) => props.isLight && light};
    ${(props) => props.hasError && tw`text-red-100 border-red-500/50 hover:border-red-500`};
`;

const Input = styled.input<Props>`
    &:not([type='checkbox']):not([type='radio']) {
        ${inputStyle};
    }

    &[type='checkbox'],
    &[type='radio'] {
        ${checkboxStyle};

        &[type='radio'] {
            ${tw`rounded-full`};
        }
    }
`;
const Textarea = styled.textarea<Props>`
    ${inputStyle}
`;

export { Textarea };
export default Input;
