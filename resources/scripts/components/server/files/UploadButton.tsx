import { CloudUploadIcon } from "@heroicons/react/outline";
import debounce from "debounce";
import { useEffect, useMemo, useRef, useState } from "react";
import tw from "twin.macro";
import http from "@/api/http";
import getFileUploadUrl from "@/api/server/files/getFileUploadUrl";
import { Button } from "@/components/elements/button/index";
import Fade from "@/components/elements/Fade";
import { ModalMask } from "@/components/elements/Modal";
import Portal from "@/components/elements/Portal";
import type { WithClassname } from "@/components/types";
import useEventListener from "@/plugins/useEventListener";
import useFileManagerSwr from "@/plugins/useFileManagerSwr";
import { useFlashKey } from "@/plugins/useFlash";
import { ServerContext } from "@/state/server";

function isFileOrDirectory(event: DragEvent): boolean {
	if (!event.dataTransfer?.types) {
		return false;
	}

	return event.dataTransfer.types.some(
		(value) => value.toLowerCase() === "files",
	);
}

export default ({ className }: WithClassname) => {
	const fileUploadInput = useRef<HTMLInputElement>(null);

	const [visible, setVisible] = useState(false);
	const timeouts = useRef<NodeJS.Timeout[]>([]);

	const { mutate } = useFileManagerSwr();
	const debouncedMutate = useMemo(() => debounce(mutate, 500), [mutate]);
	const { addError, clearAndAddHttpError } = useFlashKey("files");

	const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
	const directory = ServerContext.useStoreState(
		(state) => state.files.directory,
	);
	const {
		clearFileUploads,
		removeFileUpload,
		pushFileUpload,
		setUploadProgress,
	} = ServerContext.useStoreActions((actions) => actions.files);

	useEventListener(
		"dragenter",
		(e) => {
			e.preventDefault();
			e.stopPropagation();
			if (isFileOrDirectory(e)) {
				setVisible(true);
			}
		},
		{ capture: true },
	);

	useEventListener(
		"dragexit",
		() => {
			setVisible(false);
		},
		{
			capture: true,
		},
	);

	useEventListener("keydown", () => {
		setVisible(false);
	});

	useEffect(() => {
		return () => {
			// eslint-disable-next-line react-hooks/exhaustive-deps
			timeouts.current.forEach(clearTimeout);
		};
	}, []);

	const onUploadProgress = (data: ProgressEvent, name: string) => {
		setUploadProgress({ name, loaded: data.loaded });
	};

	const onFileSubmission = (files: FileList) => {
		if (!uuid) return;
		clearAndAddHttpError();
		const list = Array.from(files);

		// Early detection for folders. If any item is a folder, cancel everything.
		if (
			list.some((file) => !file.type && (file.size === 0 || file.size === 4096))
		) {
			return addError("Folder uploads are not supported.", "Error");
		}

		Promise.all(
			list.map((file) => {
				return getFileUploadUrl(uuid)
					.then((url) => {
						const controller = new AbortController();
						pushFileUpload({
							name: file.name,
							data: { abort: controller, loaded: 0, total: file.size },
						});

						const form = new FormData();
						form.append("files", file);

						return http
							.upload(url, form, {
								signal: controller.signal,
								params: { directory },
								onUploadProgress: (data) => onUploadProgress(data, file.name),
							})
							.then(() => {
								removeFileUpload(file.name);
								debouncedMutate(); // Trigger a "small refresh" efficiently
							})
							.catch((error) => {
								removeFileUpload(file.name);
								throw error;
							});
					})
					.catch((error) => {
						// Ensure we cleanup state if URL fetch fails for a specific file
						removeFileUpload(file.name);
						throw error;
					});
			}),
		)
			.then(() => mutate())
			.catch((error) => {
				clearAndAddHttpError(error);
			});
	};

	return (
		<>
			<Portal>
				<Fade
					appear
					in={visible}
					timeout={75}
					key={"upload_modal_mask"}
					unmountOnExit
				>
					<ModalMask
						onClick={() => {
							setVisible(false);
						}}
						onDragOver={(e) => e.preventDefault()}
						onDrop={(e) => {
							e.preventDefault();
							e.stopPropagation();

							setVisible(false);
							if (!e.dataTransfer?.files.length) return;

							// Early detection for folders during drop event.
							if (e.dataTransfer.items) {
								for (let i = 0; i < e.dataTransfer.items.length; i++) {
									const entry = e.dataTransfer.items[i].webkitGetAsEntry?.();
									if (entry?.isDirectory) {
										return addError(
											"Folder uploads are not supported.",
											"Error",
										);
									}
								}
							}

							onFileSubmission(e.dataTransfer.files);
						}}
						css={tw`bg-neutral-900/80 `}
					>
						<div
							className={
								"w-full h-full flex items-center justify-center pointer-events-none"
							}
						>
							<div
								className={
									"flex flex-col items-center justify-center space-y-4 bg-transparent border-4 border-dashed border-blue-400 border-opacity-60 rounded-3xl p-16 mx-10 w-full max-w-lg transition-all duration-150"
								}
							>
								<CloudUploadIcon
									className={"w-24 h-24 text-blue-400 animate-bounce"}
								/>
								<div className={"text-center"}>
									<p className={"font-header text-3xl text-neutral-100 mb-2"}>
										Drop to Upload
									</p>
									<p className={"text-neutral-400"}>
										Release your files anywhere to begin uploading.
									</p>
								</div>
							</div>
						</div>
					</ModalMask>
				</Fade>
			</Portal>
			<input
				type={"file"}
				ref={fileUploadInput}
				css={tw`hidden`}
				onChange={(e) => {
					if (!e.currentTarget.files) return;

					onFileSubmission(e.currentTarget.files);
					if (fileUploadInput.current) {
						fileUploadInput.current.files = null;
					}
				}}
				multiple
			/>
			<Button
				className={className}
				onClick={() => fileUploadInput.current?.click()}
			>
				<span>Upload</span>
			</Button>
		</>
	);
};
