import { differenceInHours, format, formatDistanceToNow } from "date-fns";
import { FileArchive, FileCode, FileText, Folder, Link2 } from "lucide-react";
import { join } from "pathe";
import type React from "react";
import { memo } from "react";
import isEqual from "react-fast-compare";
import { NavLink, useLocation } from "react-router-dom";
import tw from "twin.macro";
import type { FileObject } from "@/api/server/files/loadDirectory";
import CustomIcon from "@/components/server/files/CustomIcon";
import FileDropdownMenu from "@/components/server/files/FileDropdownMenu";
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

const getFileExtension = (fileName: string): string => {
	const lastDotIndex = fileName.lastIndexOf(".");
	if (lastDotIndex === -1) return "";
	return fileName.slice(lastDotIndex + 1).toLowerCase();
};

const FileIcon = ({ file }: { file: FileObject }) => {
	if (!file.isFile)
		return (
			<Folder className={"text-yellow-400"} size={20} fill="currentColor" />
		);
	if (file.isSymlink) return <Link2 className={"text-cyan-400"} size={20} />;

	const ext = getFileExtension(file.name);

	// Handle image files
	if (/\.(png|jpe?g|svg|gif|webp|bmp|ico)$/i.test(file.name)) {
		return (
			<CustomIcon
				src="https://raw.githubusercontent.com/material-extensions/vscode-material-icon-theme/refs/heads/main/icons/image.svg"
				alt="Image file icon"
			/>
		);
	}

	// Handle specific file extensions with custom icons
	// Note: Icon assignment is independent of editability status
	switch (ext) {
		case "jar":
			// Only show JAR icon if the file is actually a JAR file (not renamed archive)
			// If it's an archive type (like ZIP renamed to JAR), show archive icon instead
			if (
				file.mimetype === "application/jar" ||
				file.mimetype === "application/java-archive"
			) {
				return (
					<CustomIcon
						src="https://raw.githubusercontent.com/material-extensions/vscode-material-icon-theme/refs/heads/main/icons/jar.svg"
						alt="JAR file icon"
					/>
				);
			}
			// Fall through to archive check if it's actually an archive type
			break;
		case "js":
			return (
				<CustomIcon
					src="https://raw.githubusercontent.com/material-extensions/vscode-material-icon-theme/refs/heads/main/icons/javascript.svg"
					alt="JS file icon"
				/>
			);
		case "ts":
			return (
				<CustomIcon
					src="https://raw.githubusercontent.com/material-extensions/vscode-material-icon-theme/refs/heads/main/icons/typescript.svg"
					alt="TS file icon"
				/>
			);
		case "yaml":
		case "yml":
		case "conf":
		case "toml":
		case "properties":
			return (
				<CustomIcon
					src="https://raw.githubusercontent.com/material-extensions/vscode-material-icon-theme/refs/heads/main/icons/yaml.svg"
					alt="Configuration file icon"
				/>
			);
		case "json":
		case "json5":
			return (
				<CustomIcon
					src="https://raw.githubusercontent.com/material-extensions/vscode-material-icon-theme/refs/heads/main/icons/json.svg"
					alt="JSON file icon"
				/>
			);
		// Docker/container related files
		case "dockerfile":
		case "containerfile":
		case "docker":
			return (
				<CustomIcon
					src="https://raw.githubusercontent.com/material-extensions/vscode-material-icon-theme/refs/heads/main/icons/docker.svg"
					alt="Docker file icon"
				/>
			);
		// Database related files
		case "db":
		case "sql":
		case "h2":
			return (
				<CustomIcon
					src="https://raw.githubusercontent.com/material-extensions/vscode-material-icon-theme/refs/heads/main/icons/database.svg"
					alt="Database file icon"
				/>
			);
		// Shell/Batch script files
		case "sh":
		case "bat":
		case "ps1":
			return (
				<CustomIcon
					src="https://raw.githubusercontent.com/material-extensions/vscode-material-icon-theme/refs/heads/main/icons/powershell.svg"
					alt="Shell script file icon"
				/>
			);
		// Markdown files
		case "md":
		case "markdown":
			return (
				<CustomIcon
					src="https://raw.githubusercontent.com/material-extensions/vscode-material-icon-theme/refs/heads/main/icons/markdown.svg"
					alt="Markdown file icon"
				/>
			);
		// Kotlin files
		case "kt":
		case "kts":
			return (
				<CustomIcon
					src="https://raw.githubusercontent.com/material-extensions/vscode-material-icon-theme/refs/heads/main/icons/kotlin.svg"
					alt="Kotlin file icon"
				/>
			);
		// Java files
		case "java":
			return (
				<CustomIcon
					src="https://raw.githubusercontent.com/material-extensions/vscode-material-icon-theme/refs/heads/main/icons/java.svg"
					alt="Java file icon"
				/>
			);
		// Maven files
		case "pom":
			return (
				<CustomIcon
					src="https://raw.githubusercontent.com/material-extensions/vscode-material-icon-theme/refs/heads/main/icons/maven.svg"
					alt="Maven file icon"
				/>
			);
		// Go files
		case "go":
			return (
				<CustomIcon
					src="https://raw.githubusercontent.com/material-extensions/vscode-material-icon-theme/refs/heads/main/icons/go.svg"
					alt="Go file icon"
				/>
			);
	}

	if (file.isArchiveType())
		return <FileArchive className={"text-yellow-400"} size={20} />;
	if (file.isEditable())
		return <FileCode className={"text-green-400"} size={20} />;
	return <FileText size={20} />;
};

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
