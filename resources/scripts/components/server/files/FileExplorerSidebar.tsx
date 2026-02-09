import { ChevronRight } from "lucide-react";
import { dirname, join } from "pathe";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useSWR from "swr";
import tw, { styled } from "twin.macro";
import type { FileObject } from "@/api/server/files/loadDirectory";
import loadDirectory from "@/api/server/files/loadDirectory";
import FileIcon from "@/components/server/files/FileIcon";
import { cleanDirectoryPath, encodePathSegments } from "@/helpers";
import { getDirectorySwrKey } from "@/plugins/useFileManagerSwr";
import { ServerContext } from "@/state/server";

const SidebarContainer = styled.div`
    ${tw`hidden lg:flex flex-col h-full bg-neutral-900 border-r border-neutral-800 overflow-y-auto flex-shrink-0`};
    width: 20%;
    min-width: 12rem;
    max-width: 18rem;
`;

const FileItem = styled.div<{ $active?: boolean }>`
    ${tw`flex items-center px-3 py-1.5 cursor-pointer hover:bg-neutral-800 transition-colors duration-75 text-sm`};
    ${(props) => props.$active && tw`bg-neutral-800 text-cyan-400 border-l-2 border-cyan-400`};
`;

const sortFiles = (files: FileObject[]): FileObject[] => {
	return files
		.sort((a, b) => a.name.localeCompare(b.name))
		.sort((a, b) => (a.isFile === b.isFile ? 0 : a.isFile ? 1 : -1));
};

export default ({ currentPath }: { currentPath: string }) => {
	const { id } = useParams<{ id: string }>();
	const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);

	const [localDirectory, setLocalDirectory] = useState(dirname(currentPath));

	useEffect(() => {
		setLocalDirectory(dirname(currentPath));
	}, [currentPath]);

	const { data: files } = useSWR<FileObject[]>(
		getDirectorySwrKey(uuid || "", localDirectory),
		() => loadDirectory(uuid || "", cleanDirectoryPath(localDirectory)),
		{
			revalidateOnFocus: false,
			revalidateOnMount: true,
		},
	);

	const handleFolderClick = (name: string) => {
		setLocalDirectory(cleanDirectoryPath(join(localDirectory, name)));
	};

	const handleBackClick = () => {
		setLocalDirectory(cleanDirectoryPath(dirname(localDirectory)));
	};

	const cleanPath = (path: string) => cleanDirectoryPath(path);

	return (
		<SidebarContainer>
			<div css={tw`flex flex-col py-2`}>
				{localDirectory !== "/" && localDirectory !== "" && (
					<FileItem onClick={handleBackClick}>
						<ChevronRight size={14} css={tw`mr-2 transform rotate-180`} />
						<span css={tw`text-neutral-400 italic`}>..</span>
					</FileItem>
				)}

				{!files ? (
					<div css={tw`p-4 text-xs text-neutral-500`}>Loading...</div>
				) : (
					sortFiles(files).map((file) => {
						const isEditing =
							currentPath === cleanPath(join(localDirectory, file.name));
						const canEdit = file.isFile && file.isEditable();

						if (!file.isFile) {
							return (
								<FileItem
									key={file.name}
									onClick={() => handleFolderClick(file.name)}
								>
									<div css={tw`mr-2 flex-none`}>
										<FileIcon file={file} size={16} />
									</div>
									<span css={tw`truncate`}>{file.name}</span>
								</FileItem>
							);
						}

						return canEdit ? (
							<Link
								key={file.name}
								to={`/server/${id}/files/edit#/${encodePathSegments(cleanPath(join(localDirectory, file.name)))}`}
							>
								<FileItem $active={isEditing}>
									<div css={tw`mr-2 flex-none`}>
										<FileIcon file={file} size={16} />
									</div>
									<span css={tw`truncate`}>{file.name}</span>
								</FileItem>
							</Link>
						) : (
							<FileItem key={file.name} css={tw`opacity-50 cursor-default`}>
								<div css={tw`mr-2 flex-none`}>
									<FileIcon file={file} size={16} />
								</div>
								<span css={tw`truncate text-neutral-500`}>{file.name}</span>
							</FileItem>
						);
					})
				)}
			</div>
		</SidebarContainer>
	);
};
