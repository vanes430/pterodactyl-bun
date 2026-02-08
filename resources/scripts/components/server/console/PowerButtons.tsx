import { Play, RotateCw, Skull, Square } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/elements/button/index";
import Can from "@/components/elements/Can";
import { Dialog } from "@/components/elements/dialog";
import { ServerContext } from "@/state/server";

export type PowerAction = "start" | "stop" | "restart" | "kill";

interface PowerButtonProps {
	className?: string;
}

const PowerButtons = ({ className }: PowerButtonProps) => {
	const [open, setOpen] = useState(false);
	const status = ServerContext.useStoreState((state) => state.status.value);
	const instance = ServerContext.useStoreState(
		(state) => state.socket.instance,
	);

	const killable = status === "stopping";
	const onButtonClick = (
		action: PowerAction | "kill-confirmed",
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
	): void => {
		e.preventDefault();
		if (action === "kill") {
			setOpen(true);

			return;
		}

		if (instance) {
			setOpen(false);
			instance.send("set state", action === "kill-confirmed" ? "kill" : action);
		}
	};

	useEffect(() => {
		if (status === "offline") {
			setOpen(false);
		}
	}, [status]);

	return (
		<div className={className}>
			<Dialog.Confirm
				open={open}
				hideCloseIcon
				onClose={() => setOpen(false)}
				title={"Forcibly Stop Process"}
				confirm={"Continue"}
				onConfirmed={onButtonClick.bind(this, "kill-confirmed")}
			>
				Forcibly stopping a server can lead to data corruption.
			</Dialog.Confirm>
			<Can action={"control.start"}>
				<Button
					className={"flex-1"}
					disabled={status !== "offline"}
					onClick={onButtonClick.bind(this, "start")}
				>
					<Play size={16} className={"mr-2"} /> Start
				</Button>
			</Can>
			<Can action={"control.restart"}>
				<Button
					className={"flex-1"}
					disabled={!status}
					onClick={onButtonClick.bind(this, "restart")}
				>
					<RotateCw size={16} className={"mr-2"} /> Restart
				</Button>
			</Can>
			<Can action={"control.stop"}>
				<Button.Danger
					className={"flex-1"}
					disabled={status === "offline"}
					onClick={onButtonClick.bind(this, killable ? "kill" : "stop")}
				>
					{killable ? (
						<>
							<Skull size={16} className={"mr-2"} /> Kill
						</>
					) : (
						<>
							<Square size={16} className={"mr-2"} /> Stop
						</>
					)}
				</Button.Danger>
			</Can>
		</div>
	);
};

export default PowerButtons;
