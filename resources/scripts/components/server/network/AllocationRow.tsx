import debounce from "debounce";
import { MapPin } from "lucide-react";
import { memo, useCallback, useState } from "react";
import isEqual from "react-fast-compare";
import styled from "styled-components";
import tw from "twin.macro";
import type { Allocation } from "@/api/server/getServer";
import setPrimaryServerAllocation from "@/api/server/network/setPrimaryServerAllocation";
import setServerAllocationNotes from "@/api/server/network/setServerAllocationNotes";
import getServerAllocations from "@/api/swr/getServerAllocations";
import { Button } from "@/components/elements/button/index";
import Can from "@/components/elements/Can";
import CopyOnClick from "@/components/elements/CopyOnClick";
import GreyRowBox from "@/components/elements/GreyRowBox";
import Input from "@/components/elements/Input";
import InputSpinner from "@/components/elements/InputSpinner";
import DeleteAllocationButton from "@/components/server/network/DeleteAllocationButton";
import { ip } from "@/lib/formatters";
import { useFlashKey } from "@/plugins/useFlash";
import { ServerContext } from "@/state/server";

const Label = styled.label`
    ${tw`uppercase text-[10px] tracking-wider text-neutral-500 block select-none mb-0.5`}
`;

interface Props {
	allocation: Allocation;
}

const AllocationRow = ({ allocation }: Props) => {
	const [loading, setLoading] = useState(false);
	const { clearFlashes, clearAndAddHttpError } = useFlashKey("server:network");
	const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
	const { mutate } = getServerAllocations();

	const onNotesChanged = useCallback(
		(id: number, notes: string) => {
			mutate(
				(data) => data?.map((a) => (a.id === id ? { ...a, notes } : a)),
				false,
			);
		},
		[mutate],
	);

	const setAllocationNotes = debounce((notes: string) => {
		setLoading(true);
		clearFlashes();

		setServerAllocationNotes(uuid, allocation.id, notes)
			.then(() => onNotesChanged(allocation.id, notes))
			.catch((error) => clearAndAddHttpError(error))
			.then(() => setLoading(false));
	}, 750);

	const setPrimaryAllocation = () => {
		clearFlashes();
		mutate(
			(data) => data?.map((a) => ({ ...a, isDefault: a.id === allocation.id })),
			false,
		);

		setPrimaryServerAllocation(uuid, allocation.id)
			.then(() => mutate())
			.catch((error) => {
				clearAndAddHttpError(error);
				mutate();
			});
	};

	return (
		<GreyRowBox
			$hoverable={false}
			className={
				"flex-wrap md:flex-nowrap mt-2 !p-3 !bg-white/[0.02] hover:!bg-white/[0.04] !border-white/[0.05]"
			}
		>
			<div className={"flex items-center w-full md:w-auto flex-1 min-w-0"}>
				<div className={"pl-2 pr-4 text-neutral-500"}>
					<MapPin size={18} />
				</div>
				<div className={"mr-4 flex-1 md:flex-none md:w-48 min-w-0"}>
					<Label>{allocation.alias ? "Hostname" : "IP Address"}</Label>
					{allocation.alias ? (
						<CopyOnClick text={allocation.alias}>
							<p className={"text-sm font-medium text-neutral-200 truncate"}>
								{allocation.alias}
							</p>
						</CopyOnClick>
					) : (
						<CopyOnClick text={ip(allocation.ip)}>
							<p className={"text-sm font-medium text-neutral-200"}>
								{ip(allocation.ip)}
							</p>
						</CopyOnClick>
					)}
				</div>
				<div className={"w-24 overflow-hidden mr-4"}>
					<Label>Port</Label>
					<p className={"text-sm font-mono text-cyan-400 font-bold"}>
						{allocation.port}
					</p>
				</div>
			</div>
			<div className={"mt-4 w-full md:mt-0 md:flex-1 md:mx-4"}>
				<Label>Notes</Label>
				<InputSpinner visible={loading}>
					<Input
						className={
							"!py-1.5 !px-3 bg-white/[0.03] hover:border-white/20 border-white/10 text-xs"
						}
						placeholder={"Add a note..."}
						defaultValue={allocation.notes || undefined}
						onChange={(e) => setAllocationNotes(e.currentTarget.value)}
					/>
				</InputSpinner>
			</div>
			<div
				className={
					"flex items-center justify-end space-x-2 mt-4 w-full md:mt-0 md:w-48"
				}
			>
				{allocation.isDefault ? (
					<div
						className={
							"px-3 py-1 bg-cyan-500/10 border border-cyan-500/50 rounded-full"
						}
					>
						<span
							className={
								"text-[10px] uppercase tracking-wider font-bold text-cyan-400"
							}
						>
							Primary
						</span>
					</div>
				) : (
					<>
						<Can action={"allocation.update"}>
							<Button.Text
								size={Button.Sizes.Small}
								className={
									"!text-[10px] !px-2 !py-1 uppercase tracking-tighter hover:!bg-white/5"
								}
								onClick={setPrimaryAllocation}
							>
								Make Primary
							</Button.Text>
						</Can>
						<Can action={"allocation.delete"}>
							<DeleteAllocationButton allocation={allocation} />
						</Can>
					</>
				)}
			</div>
		</GreyRowBox>
	);
};

export default memo(AllocationRow, isEqual);
