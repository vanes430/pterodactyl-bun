import { FileArchive, FileCode, FileText, Folder, Link2 } from "lucide-react";
import type { FileObject } from "@/api/server/files/loadDirectory";
import CustomIcon from "@/components/server/files/CustomIcon";

const getFileExtension = (fileName: string): string => {
	const lastDotIndex = fileName.lastIndexOf(".");
	if (lastDotIndex === -1) return "";
	return fileName.slice(lastDotIndex + 1).toLowerCase();
};

export default ({ file, size = 20 }: { file: FileObject; size?: number }) => {
	if (!file.isFile) {
		return (
			<Folder className={"text-yellow-400"} size={size} fill="currentColor" />
		);
	}

	if (file.isSymlink) {
		return <Link2 className={"text-cyan-400"} size={size} />;
	}

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

	switch (ext) {
		case "jar":
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
		case "dockerfile":
		case "containerfile":
		case "docker":
			return (
				<CustomIcon
					src="https://raw.githubusercontent.com/material-extensions/vscode-material-icon-theme/refs/heads/main/icons/docker.svg"
					alt="Docker file icon"
				/>
			);
		case "db":
		case "sql":
		case "h2":
			return (
				<CustomIcon
					src="https://raw.githubusercontent.com/material-extensions/vscode-material-icon-theme/refs/heads/main/icons/database.svg"
					alt="Database file icon"
				/>
			);
		case "sh":
		case "bat":
		case "ps1":
			return (
				<CustomIcon
					src="https://raw.githubusercontent.com/material-extensions/vscode-material-icon-theme/refs/heads/main/icons/powershell.svg"
					alt="Shell script file icon"
				/>
			);
		case "md":
		case "markdown":
			return (
				<CustomIcon
					src="https://raw.githubusercontent.com/material-extensions/vscode-material-icon-theme/refs/heads/main/icons/markdown.svg"
					alt="Markdown file icon"
				/>
			);
		case "kt":
		case "kts":
			return (
				<CustomIcon
					src="https://raw.githubusercontent.com/material-extensions/vscode-material-icon-theme/refs/heads/main/icons/kotlin.svg"
					alt="Kotlin file icon"
				/>
			);
		case "java":
			return (
				<CustomIcon
					src="https://raw.githubusercontent.com/material-extensions/vscode-material-icon-theme/refs/heads/main/icons/java.svg"
					alt="Java file icon"
				/>
			);
		case "pom":
			return (
				<CustomIcon
					src="https://raw.githubusercontent.com/material-extensions/vscode-material-icon-theme/refs/heads/main/icons/maven.svg"
					alt="Maven file icon"
				/>
			);
		case "go":
			return (
				<CustomIcon
					src="https://raw.githubusercontent.com/material-extensions/vscode-material-icon-theme/refs/heads/main/icons/go.svg"
					alt="Go file icon"
				/>
			);
	}

	if (file.isArchiveType()) {
		return <FileArchive className={"text-yellow-400"} size={size} />;
	}

	if (file.isEditable()) {
		return <FileCode className={"text-green-400"} size={size} />;
	}

	return <FileText size={size} />;
};
