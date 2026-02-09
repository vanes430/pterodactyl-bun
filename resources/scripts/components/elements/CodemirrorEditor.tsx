import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { php } from "@codemirror/lang-php";
import { python } from "@codemirror/lang-python";
import { sql } from "@codemirror/lang-sql";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";
import { StreamLanguage } from "@codemirror/language";
import { nginx } from "@codemirror/legacy-modes/mode/nginx";
import { properties } from "@codemirror/legacy-modes/mode/properties";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { toml } from "@codemirror/legacy-modes/mode/toml";
import { keymap } from "@codemirror/view";
import { githubDark } from "@uiw/codemirror-theme-github";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import type React from "react";
import { useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
import tw from "twin.macro";
import modes from "@/modes";

const EditorContainer = styled.div`
    ${tw`relative w-full h-full`};

    > div {
        ${tw`rounded h-full w-full`};
    }

    .cm-editor {
        font-family: "JetBrains Mono", "Fira Code", "Source Code Pro", monospace;
        font-size: 13px;
        line-height: 1.5rem;
        ${tw`rounded h-full`};
    }

    .cm-scroller {
        ${tw`rounded h-full`};
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

import type { Extension } from "@codemirror/state";

const getLanguageExtension = (mode: string): Extension => {
	switch (mode) {
		case "text/x-csrc":
		case "text/x-c++src":
		case "text/x-csharp":
		case "text/x-go":
		case "text/x-rustsrc":
			// For now, we'll map these to generic or closest equivalents available in the minimal set,
			// or fallback to plain text if the specific language package isn't installed.
			// Ideally, you'd install @codemirror/lang-cpp, @codemirror/lang-rust, etc.
			// For this implementation, we will fallback or map to what we have.
			// Using javascript for C-like syntax highlighting as a rough approximation if needed,
			// but better to just return empty array (plain text) if exact match isn't there to avoid confusion.
			return [];
		case "text/css":
		case "text/x-scss":
		case "text/x-sass":
			return css();
		case "text/html":
		case "script/x-vue":
			return html();
		case "text/javascript":
		case "application/json":
		case "application/typescript":
			return mode === "application/json" ? json() : javascript();
		case "text/x-markdown":
		case "text/x-gfm":
			return markdown();
		case "text/x-php":
			return php();
		case "text/x-python":
			return python();
		case "text/x-sh":
			return StreamLanguage.define(shell);
		case "text/x-nginx-conf":
			return StreamLanguage.define(nginx);
		case "text/x-toml":
			return StreamLanguage.define(toml);
		case "text/x-properties":
			return StreamLanguage.define(properties);
		case "text/x-sql":
		case "text/x-mysql":
		case "text/x-mariadb":
		case "text/x-pgsql":
		case "text/x-sqlite":
		case "text/x-cassandra":
		case "text/x-mssql":
			return sql();
		case "application/xml":
			return xml();
		case "text/x-yaml":
			return yaml();
		default:
			return [];
	}
};

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
	const editor = useRef<ReactCodeMirrorRef>(null);

	const extensions = useMemo(() => {
		return [
			getLanguageExtension(mode),
			keymap.of([
				{
					key: "Mod-s",
					run: () => {
						onContentSaved();
						return true;
					},
				},
			]),
		];
	}, [mode, onContentSaved]);

	useEffect(() => {
		if (filename === undefined) {
			return;
		}

		const detectedMode = findModeByFilename(filename);
		onModeChanged(detectedMode?.mime || "text/plain");
	}, [filename, onModeChanged]);

	useEffect(() => {
		fetchContent(() => {
			if (!editor.current?.view) {
				return Promise.reject(
					new Error("no editor session has been configured"),
				);
			}
			return Promise.resolve(editor.current.view.state.doc.toString());
		});
	}, [fetchContent]);

	return (
		<EditorContainer style={style}>
			<CodeMirror
				ref={editor}
				value={initialContent}
				theme={githubDark}
				extensions={extensions}
				basicSetup={{
					lineNumbers: true,
					foldGutter: true,
					highlightActiveLineGutter: true,
					autocompletion: true,
					highlightActiveLine: true,
					bracketMatching: true,
					closeBrackets: true,
					history: true,
					drawSelection: true,
					dropCursor: true,
					allowMultipleSelections: true,
					indentOnInput: true,
					syntaxHighlighting: true,
				}}
				height="100%"
			/>
		</EditorContainer>
	);
};
