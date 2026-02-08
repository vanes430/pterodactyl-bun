import debounce from "debounce";
import { type Actions, useStoreActions, useStoreState } from "easy-peasy";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import styled from "styled-components";
import tw from "twin.macro";
import { z } from "zod";
import getServers from "@/api/getServers";
import type { Server } from "@/api/server/getServer";
import FormField from "@/components/elements/FormField";
import InputSpinner from "@/components/elements/InputSpinner";
import Modal, { type RequiredModalProps } from "@/components/elements/Modal";
import { ip } from "@/lib/formatters";
import type { ApplicationStore } from "@/state";

type Props = RequiredModalProps;

interface Values {
	term: string;
}

const schema = z.object({
	term: z
		.string()
		.min(3, "Please enter at least three characters to begin searching."),
});

const ServerResult = styled(Link)`
    ${tw`flex items-center bg-neutral-900 p-4 rounded border-l-4 border-neutral-900 no-underline transition-all duration-150`};

    &:hover {
        ${tw`shadow border-cyan-500`};
    }

    &:not(:last-of-type) {
        ${tw`mb-2`};
    }
`;

export default ({ ...props }: Props) => {
	const ref = useRef<HTMLInputElement>(null);
	const isAdmin = useStoreState((state) => state.user.data?.rootAdmin);
	const [servers, setServers] = useState<Server[]>([]);
	const { clearAndAddHttpError, clearFlashes } = useStoreActions(
		(actions: Actions<ApplicationStore>) => actions.flashes,
	);

	const {
		register,
		watch,
		formState: { isSubmitting },
	} = useForm<Values>({
		defaultValues: {
			term: "",
		},
	});

	const term = watch("term");

	const search = debounce((value: string) => {
		if (value.length < 3) return;

		clearFlashes("search");

		getServers({ query: value, type: isAdmin ? "admin-all" : undefined })
			.then((servers) =>
				setServers(servers.items.filter((_, index) => index < 5)),
			)
			.catch((error) => {
				console.error(error);
				clearAndAddHttpError({ key: "search", error });
			})
			.then(() => {
				// Focus ref if needed, though usually automatic in inputs
			});
	}, 500);

	useEffect(() => {
		search(term);
	}, [term, search]);

	useEffect(() => {
		if (props.visible) {
			setTimeout(() => ref.current?.focus(), 50);
		}
	}, [props.visible]);

	return (
		<Modal {...props}>
			<form>
				<InputSpinner visible={isSubmitting}>
					<FormField
						id={"term"}
						label={"Search term"}
						description={
							"Enter a server name, uuid, or allocation to begin searching."
						}
						{...register("term")}
						ref={(e) => {
							register("term").ref(e);
							ref.current = e;
						}}
						autoFocus
					/>
				</InputSpinner>
			</form>
			{servers.length > 0 && (
				<div css={tw`mt-6`}>
					{servers.map((server) => (
						<ServerResult
							key={server.uuid}
							to={`/server/${server.id}`}
							onClick={() => props.onDismissed()}
						>
							<div css={tw`flex-1 mr-4`}>
								<p css={tw`text-sm`}>{server.name}</p>
								<p css={tw`mt-1 text-xs text-neutral-400`}>
									{server.allocations
										.filter((alloc) => alloc.isDefault)
										.map((allocation) => (
											<span key={allocation.ip + allocation.port.toString()}>
												{allocation.alias || ip(allocation.ip)}:
												{allocation.port}
											</span>
										))}
								</p>
							</div>
							<div css={tw`flex-none text-right`}>
								<span
									css={tw`text-xs py-1 px-2 bg-cyan-800 text-cyan-100 rounded`}
								>
									{server.node}
								</span>
							</div>
						</ServerResult>
					))}
				</div>
			)}
		</Modal>
	);
};
