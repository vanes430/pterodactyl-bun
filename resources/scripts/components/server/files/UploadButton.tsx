import { CloudUploadIcon } from "@heroicons/react/outline";
import axios, { type AxiosProgressEvent } from "axios";
import { useEffect, useRef, useState } from "react";
import tw from "twin.macro";
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

	const onUploadProgress = (data: AxiosProgressEvent, name: string) => {
		setUploadProgress({ name, loaded: data.loaded });
	};

	const onFileSubmission = (files: FileList) => {
		clearAndAddHttpError();
		const list = Array.from(files);
		if (list.some((file) => !file.type && (!file.size || file.size === 4096))) {
			return addError("Folder uploads are not supported.", "Error");
		}

		const uploads = list.map((file) => {
			const controller = new AbortController();
			pushFileUpload({
				name: file.name,
				data: { abort: controller, loaded: 0, total: file.size },
			});

			return () =>
				getFileUploadUrl(uuid).then((url) =>
					axios
						.post(
							url,
							{ files: file },
							{
								signal: controller.signal,
								headers: { "Content-Type": "multipart/form-data" },
								params: { directory },
								onUploadProgress: (data) => onUploadProgress(data, file.name),
							},
						)
						.then(() =>
							timeouts.current.push(
								setTimeout(() => removeFileUpload(file.name), 500),
							),
						),
				);
		});

		Promise.all(uploads.map((fn) => fn()))
			.then(() => mutate())
			.catch((error) => {
				clearFileUploads();
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

							onFileSubmission(e.dataTransfer.files);
						}}
						css={tw`bg-neutral-900/80 backdrop-blur-sm`}
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
								<CloudUploadIcon className={"w-24 h-24 text-blue-400 animate-bounce"} />
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
				Upload
			</Button>
		</>
	);
};