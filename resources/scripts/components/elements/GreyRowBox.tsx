import styled from "styled-components/macro";
import tw from "twin.macro";

export default styled.div<{ $hoverable?: boolean }>`
    ${tw`flex rounded no-underline text-neutral-200 items-center p-4 transition-all duration-300 overflow-hidden`};
    ${tw`bg-neutral-800/40 backdrop-blur-md border border-neutral-700/50`};

    ${(props) => props.$hoverable !== false && tw`hover:border-neutral-500/50 hover:bg-neutral-800/60`};

    & .icon {
        ${tw`rounded-full w-12 h-12 flex items-center justify-center bg-neutral-700/50 p-3`};
    }
`;
