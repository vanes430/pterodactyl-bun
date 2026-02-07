import {
	Copy,
	CornerLeftUp,
	Download,
	FileArchive,
	FileCode,
	MoreHorizontal,
	PackageOpen,
	Pencil,
	Trash2,
} from "lucide-react";
import { join } from "pathe";
import type React from "react";
import { memo, useRef, useState } from "react";
import isEqual from "react-fast-compare";
import styled from "styled-components/macro";
import tw from "twin.macro";
import compressFiles from "@/api/server/files/compressFiles";
import copyFile from "@/api/server/files/copyFile";
import decompressFiles from "@/api/server/files/decompressFiles";
import deleteFiles from "@/api/server/files/deleteFiles";
import getFileDownloadUrl from "@/api/server/files/getFileDownloadUrl";
import type { FileObject } from "@/api/server/files/loadDirectory";
import Can from "@/components/elements/Can";
import DropdownMenu from "@/components/elements/DropdownMenu";
import { Dialog } from "@/components/elements/dialog";
import SpinnerOverlay from "@/components/elements/SpinnerOverlay";
import ChmodFileModal from "@/components/server/files/ChmodFileModal";
import RenameFileModal from "@/components/server/files/RenameFileModal";
import useEventListener from "@/plugins/useEventListener";
import useFileManagerSwr from "@/plugins/useFileManagerSwr";
import useFlash from "@/plugins/useFlash";
import { ServerContext } from "@/state/server";

type ModalType = "rename" | "move" | "chmod";

const StyledRow = styled.div<{ $danger?: boolean }>`
    ${tw`p-2 flex items-center rounded-lg`};
    ${(props) =>
			props.$danger
				? tw`hover:bg-red-500/10 hover:text-red-400`
				: tw`hover:bg-white/10 hover:text-white`};
`;

interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
	icon: React.ComponentType<any>;
	title: string;
	$danger?: boolean;
}

const Row = ({ icon: Icon, title, ...props }: RowProps) => (
	<StyledRow {...props}>
		<Icon size={14} className={"mr-2"} />
		<span>{title}</span>
	</StyledRow>
);

const FileDropdownMenu = ({ file }: { file: FileObject }) => {
	const onClickRef = useRef<DropdownMenu>(null);
	const [showSpinner, setShowSpinner] = useState(false);
	const [modal, setModal] = useState<ModalType | null>(null);
	const [showConfirmation, setShowConfirmation] = useState(false);

	const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
	const { mutate } = useFileManagerSwr();
	const { clearAndAddHttpError, clearFlashes } = useFlash();
	const directory = ServerContext.useStoreState(
		(state) => state.files.directory,
	);

	useEventListener(`pterodactyl:files:ctx:${file.key}`, (e: CustomEvent) => {
		if (onClickRef.current) {
			onClickRef.current.triggerMenu(e.detail.pageX, e.detail.pageY);
		}
	});

	const doDeletion = () => {
		clearFlashes("files");

		// For UI speed, immediately remove the file from the listing before calling the deletion function.
		// If the delete actually fails, we'll fetch the current directory contents again automatically.
		mutate((files) => files.filter((f) => f.key !== file.key), false);

		deleteFiles(uuid, directory, [file.name]).catch((error) => {
			mutate();
			clearAndAddHttpError({ key: "files", error });
		});
	};

	const doCopy = () => {
		setShowSpinner(true);
		clearFlashes("files");

		copyFile(uuid, join(directory, file.name))
			.then(() => mutate())
			.catch((error) => clearAndAddHttpError({ key: "files", error }))
			.then(() => setShowSpinner(false));
	};

	const doDownload = () => {
		setShowSpinner(true);
		clearFlashes("files");

		getFileDownloadUrl(uuid, join(directory, file.name))
			.then((url) => {
				// @ts-expect-error this is valid
				window.location = url;
			})
			.catch((error) => clearAndAddHttpError({ key: "files", error }))
			.then(() => setShowSpinner(false));
	};

	const doArchive = () => {
		setShowSpinner(true);
		clearFlashes("files");

		compressFiles(uuid, directory, [file.name])
			.then(() => mutate())
			.catch((error) => clearAndAddHttpError({ key: "files", error }))
			.then(() => setShowSpinner(false));
	};

	const doUnarchive = () => {
		setShowSpinner(true);
		clearFlashes("files");

		decompressFiles(uuid, directory, file.name)
			.then(() => mutate())
			.catch((error) => clearAndAddHttpError({ key: "files", error }))
			.then(() => setShowSpinner(false));
	};

	return (
		<>
			<Dialog.Confirm
				open={showConfirmation}
				onClose={() => setShowConfirmation(false)}
				title={`Delete ${file.isFile ? "File" : "Directory"}`}
				confirm={"Delete"}
				onConfirmed={doDeletion}
			>
				You will not be able to recover the contents of&nbsp;
				<span className={"font-semibold text-gray-50"}>{file.name}</span> once
				deleted.
			</Dialog.Confirm>
			<DropdownMenu
				ref={onClickRef}
				renderToggle={(onClick) => (
					<div css={tw`px-4 py-2 hover:text-white`} onClick={onClick}>
						<MoreHorizontal size={20} />
						{modal ? (
							modal === "chmod" ? (
								<ChmodFileModal
									visible
									appear
									files={[{ file: file.name, mode: file.modeBits }]}
									onDismissed={() => setModal(null)}
								/>
							) : (
								<RenameFileModal
									visible
									appear
									files={[file.name]}
									useMoveTerminology={modal === "move"}
									onDismissed={() => setModal(null)}
								/>
							)
						) : null}
						<SpinnerOverlay visible={showSpinner} fixed size={"large"} />
					</div>
				)}
			>
				<Can action={"file.update"}>
					<Row
						onClick={() => setModal("rename")}
						icon={Pencil}
						title={"Rename"}
					/>
					<Row
						onClick={() => setModal("move")}
						icon={CornerLeftUp}
						title={"Move"}
					/>
					<Row
						onClick={() => setModal("chmod")}
						icon={FileCode}
						title={"Permissions"}
					/>
				</Can>
				{file.isFile && (
					<Can action={"file.create"}>
						<Row onClick={doCopy} icon={Copy} title={"Copy"} />
					</Can>
				)}
				{file.isArchiveType() ? (
					<Can action={"file.create"}>
						<Row onClick={doUnarchive} icon={PackageOpen} title={"Unarchive"} />
					</Can>
				) : (
					<Can action={"file.archive"}>
						<Row onClick={doArchive} icon={FileArchive} title={"Archive"} />
					</Can>
				)}
				{file.isFile && (
					<Row onClick={doDownload} icon={Download} title={"Download"} />
				)}
				<Can action={"file.delete"}>
					<Row
						onClick={() => setShowConfirmation(true)}
						icon={Trash2}
						title={"Delete"}
						$danger
					/>
				</Can>
			</DropdownMenu>
		</>
	);
};

export default memo(FileDropdownMenu, isEqual);
