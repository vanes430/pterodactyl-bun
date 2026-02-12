import { Trash2 } from "lucide-react";
import { useState } from "react";
import type { Allocation } from "@/api/server/getServer";
import deleteServerAllocation from "@/api/server/network/deleteServerAllocation";
import getServerAllocations from "@/api/swr/getServerAllocations";
import { Button } from "@/components/elements/button/index";
import { Dialog } from "@/components/elements/dialog";
import { useFlashKey } from "@/plugins/useFlash";
import { ServerContext } from "@/state/server";

interface Props {
	allocation: Allocation;
}

const DeleteAllocationButton = ({ allocation }: Props) => {
	const [confirm, setConfirm] = useState(false);

	const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
	const setServerFromState = ServerContext.useStoreActions(
		(actions) => actions.server.setServerFromState,
	);

	const { mutate } = getServerAllocations();
	const { clearFlashes, clearAndAddHttpError } = useFlashKey("server:network");

	const deleteAllocation = () => {
		clearFlashes();

		mutate((data) => data?.filter((a) => a.id !== allocation.id), false);

		deleteServerAllocation(uuid, allocation.id)
			.then(() => mutate())
			.catch((error) => {
				clearAndAddHttpError(error);
				mutate();
			});
	};

	return (
		<>
			<Dialog.Confirm
				open={confirm}
				onClose={() => setConfirm(false)}
				title={"Remove Allocation"}
				confirm={"Delete"}
				onConfirmed={deleteAllocation}
			>
				<p>This allocation will be immediately removed from your server.</p>
				<div
					className={
						"mt-4 bg-neutral-900 p-3 rounded-lg border border-white/5 space-y-1"
					}
				>
					<p className={"text-sm text-neutral-400"}>
						IP Address:{" "}
						<span className={"text-neutral-200 font-mono"}>
							{allocation.alias || allocation.ip}
						</span>
					</p>
					<p className={"text-sm text-neutral-400"}>
						Port:{" "}
						<span className={"text-cyan-400 font-mono font-bold"}>
							{allocation.port}
						</span>
					</p>
					{allocation.notes && (
						<p className={"text-sm text-neutral-400"}>
							Notes:{" "}
							<span className={"text-neutral-200 italic"}>
								{allocation.notes}
							</span>
						</p>
					)}
				</div>
			</Dialog.Confirm>
			<Button.Danger
				variant={Button.Variants.Secondary}
				size={Button.Sizes.Small}
				shape={Button.Shapes.IconSquare}
				type={"button"}
				className={
					"!p-2 !bg-transparent hover:!bg-red-500/10 !border-none group"
				}
				onClick={() => setConfirm(true)}
			>
				<Trash2
					size={16}
					className={
						"text-neutral-500 group-hover:text-red-400 transition-colors duration-75"
					}
				/>
			</Button.Danger>
		</>
	);
};

export default DeleteAllocationButton;
