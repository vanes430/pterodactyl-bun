import CodeMirror from "codemirror";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import tw from "twin.macro";
import modes from "@/modes";

require("codemirror/lib/codemirror.css");
require("codemirror/theme/dracula.css");
require("codemirror/addon/edit/closebrackets");
require("codemirror/addon/edit/closetag");
require("codemirror/addon/edit/matchbrackets");
require("codemirror/addon/edit/matchtags");
require("codemirror/addon/edit/trailingspace");
require("codemirror/addon/fold/foldcode");
require("codemirror/addon/fold/foldgutter.css");
require("codemirror/addon/fold/foldgutter");
require("codemirror/addon/fold/brace-fold");
require("codemirror/addon/fold/comment-fold");
require("codemirror/addon/fold/indent-fold");
require("codemirror/addon/fold/markdown-fold");
require("codemirror/addon/fold/xml-fold");
require("codemirror/addon/hint/show-hint.css");
require("codemirror/addon/hint/show-hint");
require("codemirror/addon/mode/simple");
require("codemirror/addon/dialog/dialog.css");
require("codemirror/addon/dialog/dialog");
require("codemirror/addon/scroll/annotatescrollbar");
require("codemirror/addon/scroll/scrollpastend");
require("codemirror/addon/scroll/simplescrollbars.css");
require("codemirror/addon/scroll/simplescrollbars");
require("codemirror/addon/search/jump-to-line");
require("codemirror/addon/search/match-highlighter");
require("codemirror/addon/search/matchesonscrollbar.css");
require("codemirror/addon/search/matchesonscrollbar");
require("codemirror/addon/search/search");
require("codemirror/addon/search/searchcursor");

// Priority Languages (Commonly used in Pterodactyl)
require("codemirror/mode/yaml/yaml");
require("codemirror/mode/shell/shell");
require("codemirror/mode/php/php");
require("codemirror/mode/javascript/javascript");
require("codemirror/mode/properties/properties");

const EditorContainer = styled.div`
    min-height: 32rem;
    height: calc(100vh - 16rem);
    ${tw`relative w-full`};

    > div {
        ${tw`rounded h-full w-full`};
    }

    .CodeMirror {
        font-family: "JetBrains Mono", "Fira Code", "Source Code Pro", monospace;
        font-size: 13px;
        line-height: 1.5rem;
        ${tw`rounded h-full`};
    }

    .CodeMirror-linenumber {
        padding: 1px 12px 0 12px !important;
    }

    .CodeMirror-foldmarker {
        color: #cbccc6;
        text-shadow: none;
        margin-left: 0.25rem;
        margin-right: 0.25rem;
    }
`;

export interface Props {
	style?: React.CSSProperties;
	initialContent?: string;
	mode: string;
	filename?: string;
	onModeChanged: (mode: string) => void;
	fetchContent: (callback: () => Promise<string>) => void;
	onContentSaved: () => void;
}

const findModeByFilename = (filename: string) => {
	for (let i = 0; i < modes.length; i++) {
		const info = modes[i];

		if (info.file?.test(filename)) {
			return info;
		}
	}

	const dot = filename.lastIndexOf(".");
	const ext = dot > -1 && filename.substring(dot + 1, filename.length);

	if (ext) {
		for (let i = 0; i < modes.length; i++) {
			const info = modes[i];
			if (info.ext) {
				for (let j = 0; j < info.ext.length; j++) {
					if (info.ext[j] === ext) {
						return info;
					}
				}
			}
		}
	}

	return undefined;
};

export default ({
	style,
	initialContent,
	filename,
	mode,
	fetchContent,
	onContentSaved,
	onModeChanged,
}: Props) => {
	const [editor, setEditor] = useState<CodeMirror.Editor>();

	const ref = useCallback((node: HTMLTextAreaElement | null) => {
		if (!node) return;

		const e = CodeMirror.fromTextArea(node, {
			mode: "text/plain",
			theme: "dracula",
			indentUnit: 4,
			smartIndent: true,
			tabSize: 4,
			indentWithTabs: false,
			lineWrapping: true,
			lineNumbers: true,
			// @ts-ignore
			foldGutter: true,
			fixedGutter: true,
			scrollbarStyle: "native",
			coverGutterNextToScrollbar: false,
			readOnly: false,
			showCursorWhenSelecting: false,
			autofocus: false,
			spellcheck: true,
			autocorrect: false,
			autocapitalize: false,
			lint: false,
			autoCloseBrackets: true,
			matchBrackets: true,
			gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
		});

		setEditor(e);
	}, []);

	useEffect(() => {
		if (filename === undefined) {
			return;
		}

		onModeChanged(findModeByFilename(filename)?.mime || "text/plain");
	}, [filename, onModeChanged]);

	useEffect(() => {
		if (!editor) return;

		const modeInfo = modes.find((m) => m.mime === mode);
		if (modeInfo && modeInfo.mode !== "null") {
			import(`codemirror/mode/${modeInfo.mode}/${modeInfo.mode}.js`)
				.then(() => editor.setOption("mode", mode))
				.catch((e) => {
					console.warn(`Failed to load CodeMirror mode [${modeInfo.mode}]:`, e);
					editor.setOption("mode", "text/plain");
				});
		} else {
			editor.setOption("mode", "text/plain");
		}
	}, [editor, mode]);

	useEffect(() => {
		if (editor) {
			editor.setValue(initialContent || "");
			// Reset the history so that "Ctrl+Z" doesn't delete the intial content
			// we just set above.
			editor.setHistory({ done: [], undone: [] });
		}
	}, [editor, initialContent]);

	useEffect(() => {
		if (!editor) {
			fetchContent(() =>
				Promise.reject(new Error("no editor session has been configured")),
			);
			return;
		}

		editor.addKeyMap({
			"Ctrl-S": () => onContentSaved(),
			"Cmd-S": () => onContentSaved(),
		});

		fetchContent(() => Promise.resolve(editor.getValue()));
	}, [editor, fetchContent, onContentSaved]);

	return (
		<EditorContainer style={style}>
			<textarea ref={ref} />
		</EditorContainer>
	);
};
