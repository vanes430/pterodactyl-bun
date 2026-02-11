import { dirname } from "pathe";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import tw from "twin.macro";
import { httpErrorToHuman } from "@/api/http";
import getFileContents from "@/api/server/files/getFileContents";
import saveFileContents from "@/api/server/files/saveFileContents";
import Button from "@/components/elements/Button";
import Can from "@/components/elements/Can";
import CodemirrorEditor from "@/components/elements/CodemirrorEditor";
import ErrorBoundary from "@/components/elements/ErrorBoundary";
import PageContentBlock from "@/components/elements/PageContentBlock";
import { ServerError } from "@/components/elements/ScreenBlock";
import Select from "@/components/elements/Select";
import SpinnerOverlay from "@/components/elements/SpinnerOverlay";
import FlashMessageRender from "@/components/FlashMessageRender";
import FileExplorerSidebar from "@/components/server/files/FileExplorerSidebar";
import FileManagerBreadcrumbs from "@/components/server/files/FileManagerBreadcrumbs";
import FileNameModal from "@/components/server/files/FileNameModal";
import { encodePathSegments, hashToPath } from "@/helpers";
import modes from "@/modes";
import useFileManagerSwr from "@/plugins/useFileManagerSwr";
import useFlash from "@/plugins/useFlash";
import { ServerContext } from "@/state/server";

export default () => {
	const [error, setError] = useState("");
	const { action } = useParams<{ action: "new" | string }>();
	const [loading, setLoading] = useState(action === "edit");
	const [content, setContent] = useState("");
	const [modalVisible, setModalVisible] = useState(false);
	const [mode, setMode] = useState("text/plain");

	const navigate = useNavigate();
	const { hash } = useLocation();

	const id = ServerContext.useStoreState((state) => state.server.data?.id);
	const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
	const setDirectory = ServerContext.useStoreActions(
		(actions) => actions.files.setDirectory,
	);
	const { data: files } = useFileManagerSwr();
	const { addError, clearFlashes } = useFlash();

	let fetchFileContent: null | (() => Promise<string>) = null;

	useEffect(() => {
		if (action === "new") return;
		const path = hashToPath(hash);
		setDirectory(dirname(path));
	}, [hash, action, setDirectory]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: files is excluded to prevent re-fetching content when navigating folders in sidebar
	useEffect(() => {
		if (action === "new") return;

		setError("");
		const path = hashToPath(hash);
		const fileName = path.split("/").pop();

		// Jika daftar file sudah dimuat, cek apakah file ini bisa diedit
		if (files) {
			const file = files.find((f) => f.name === fileName);
			if (file && !file.isEditable()) {
				setError("This file type cannot be opened in the editor.");
				return;
			}
		}

		setLoading(true);
		setContent("");
		getFileContents(uuid, path)
			.then(setContent)
			.catch((error) => {
				console.error(error);
				setError(httpErrorToHuman(error));
			})
			.then(() => setLoading(false));
	}, [action, uuid, hash]);

	const save = (name?: string) => {
		if (!fetchFileContent) {
			return;
		}

		setLoading(true);
		clearFlashes("files:view");
		fetchFileContent()
			.then((content) =>
				saveFileContents(uuid, name || hashToPath(hash), content),
			)
			.then(() => {
				if (name) {
					navigate(`/server/${id}/files/edit#/${encodePathSegments(name)}`);
					return;
				}

				return Promise.resolve();
			})
			.catch((error) => {
				console.error(error);
				addError({ message: httpErrorToHuman(error), key: "files:view" });
			})
			.then(() => setLoading(false));
	};

	if (error) {
		return (
			<ServerError
				message={error}
				onBack={() => navigate(`/server/${id}/files`)}
			/>
		);
	}

	return (
		<PageContentBlock isextended>
			<FlashMessageRender byKey={"files:view"} css={tw`mb-4`} />
			<ErrorBoundary>
				<div css={tw`mb-4`}>
					<FileManagerBreadcrumbs
						withinFileEditor
						isNewFile={action !== "edit"}
					/>
				</div>
			</ErrorBoundary>
			{hash.replace(/^#/, "").endsWith(".pteroignore") && (
				<div
					css={tw`mb-4 p-4 border-l-4 bg-neutral-900 rounded border-cyan-400`}
				>
					<p css={tw`text-neutral-300 text-sm`}>
						You&apos;re editing a{" "}
						<code css={tw`font-mono bg-black rounded py-px px-1`}>
							.pteroignore
						</code>{" "}
						file. Any files or directories listed in here will be excluded from
						backups. Wildcards are supported by using an asterisk (
						<code css={tw`font-mono bg-black rounded py-px px-1`}>*</code>). You
						can negate a prior rule by prepending an exclamation point (
						<code css={tw`font-mono bg-black rounded py-px px-1`}>!</code>).
					</p>
				</div>
			)}
			<FileNameModal
				visible={modalVisible}
				onDismissed={() => setModalVisible(false)}
				onFileNamed={(name) => {
					setModalVisible(false);
					save(name);
				}}
			/>
			<div
				css={tw`flex overflow-hidden rounded border border-neutral-800`}
				style={{ height: "calc(100vh - 16rem)", minHeight: "32rem" }}
			>
				<FileExplorerSidebar currentPath={hashToPath(hash)} />
				<div css={tw`relative flex-1 min-w-0`}>
					<SpinnerOverlay visible={loading} />
					<CodemirrorEditor
						key={hash}
						mode={mode}
						filename={hash.replace(/^#/, "")}
						onModeChanged={setMode}
						initialContent={content}
						fetchContent={(value) => {
							fetchFileContent = value;
						}}
						onContentSaved={() => {
							if (action !== "edit") {
								setModalVisible(true);
							} else {
								save();
							}
						}}
					/>
				</div>
			</div>
			<div css={tw`flex justify-end mt-4`}>
				<div css={tw`flex-1 sm:flex-none rounded bg-neutral-900 mr-4`}>
					<Select value={mode} onChange={(e) => setMode(e.currentTarget.value)}>
						{modes.map((mode) => (
							<option key={`${mode.name}_${mode.mime}`} value={mode.mime}>
								{mode.name}
							</option>
						))}
					</Select>
				</div>
				{action === "edit" ? (
					<Can action={"file.update"}>
						<Button css={tw`flex-1 sm:flex-none`} onClick={() => save()}>
							Save Content
						</Button>
					</Can>
				) : (
					<Can action={"file.create"}>
						<Button
							css={tw`flex-1 sm:flex-none`}
							onClick={() => setModalVisible(true)}
						>
							Create File
						</Button>
					</Can>
				)}
			</div>
		</PageContentBlock>
	);
};
