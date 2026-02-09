import { differenceInHours, format, formatDistanceToNow } from "date-fns";
import { join } from "pathe";
import type React from "react";
import { memo } from "react";
import isEqual from "react-fast-compare";
import { NavLink, useLocation } from "react-router-dom";
import tw from "twin.macro";
import type { FileObject } from "@/api/server/files/loadDirectory";
import FileDropdownMenu from "@/components/server/files/FileDropdownMenu";
import FileIcon from "@/components/server/files/FileIcon";
import SelectFileCheckbox from "@/components/server/files/SelectFileCheckbox";
import { encodePathSegments } from "@/helpers";
import { bytesToString } from "@/lib/formatters";
import { usePermissions } from "@/plugins/usePermissions";
import { ServerContext } from "@/state/server";
import styles from "./style.module.css";

const Clickable: React.FC<React.PropsWithChildren<{ file: FileObject }>> = memo(
	({ file, children }) => {
		const [canRead] = usePermissions(["file.read"]);
		const [canReadContents] = usePermissions(["file.read-content"]);
		const directory = ServerContext.useStoreState(
			(state) => state.files.directory,
		);

		const location = useLocation();

		return (file.isFile && (!file.isEditable() || !canReadContents)) ||
			(!file.isFile && !canRead) ? (
			<div className={styles.details}>{children}</div>
		) : (
			<NavLink
				className={styles.details}
				to={`${location.pathname}${file.isFile ? "/edit" : ""}#${encodePathSegments(join(directory, file.name))}`}
			>
				{children}
			</NavLink>
		);
	},
	isEqual,
);

const FileObjectRow = ({ file }: { file: FileObject }) => (
	<div
		className={styles.file_row}
		key={file.name}
		onContextMenu={(e) => {
			e.preventDefault();
			window.dispatchEvent(
				new CustomEvent(`pterodactyl:files:ctx:${file.key}`, {
					detail: { pageX: e.pageX, pageY: e.pageY },
				}),
			);
		}}
	>
		<SelectFileCheckbox name={file.name} />
		<Clickable file={file}>
			<div css={tw`flex-none text-neutral-400 mr-4`}>
				<FileIcon file={file} />
			</div>
			<div css={tw`flex-1 truncate font-medium`}>{file.name}</div>
			{file.isFile && (
				<div
					css={tw`w-1/6 text-right mr-4 hidden sm:block text-neutral-400 text-xs font-mono`}
				>
					{bytesToString(file.size)}
				</div>
			)}
			<div
				css={tw`w-1/5 text-right mr-4 hidden md:block text-neutral-500 text-xs`}
				title={file.modifiedAt.toString()}
			>
				{Math.abs(differenceInHours(file.modifiedAt, new Date())) > 48
					? format(file.modifiedAt, "MMM do, yyyy h:mma")
					: formatDistanceToNow(file.modifiedAt, { addSuffix: true })}
			</div>
		</Clickable>
		<FileDropdownMenu file={file} />
	</div>
);

export default memo(FileObjectRow, (prevProps, nextProps) => {
	/* eslint-disable @typescript-eslint/no-unused-vars */
	const { isArchiveType, isEditable, ...prevFile } = prevProps.file;
	const {
		isArchiveType: nextIsArchiveType,
		isEditable: nextIsEditable,
		...nextFile
	} = nextProps.file;
	/* eslint-enable @typescript-eslint/no-unused-vars */

	return isEqual(prevFile, nextFile);
});
