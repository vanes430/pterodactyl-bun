import type {
	AllocationAttributes,
	EggVariableAttributes,
	FileObjectAttributes,
	ServerBackupAttributes,
} from "@/api/definitions/api";
import type { FractalResponseData } from "@/api/http";
import type { FileObject } from "@/api/server/files/loadDirectory";
import type { Allocation } from "@/api/server/getServer";
import type { ServerBackup, ServerEggVariable } from "@/api/server/types";

export const rawDataToServerAllocation = (
	data: FractalResponseData<AllocationAttributes>,
): Allocation => ({
	id: data.attributes.id,
	ip: data.attributes.ip,
	alias: data.attributes.ip_alias,
	port: data.attributes.port,
	notes: data.attributes.notes,
	isDefault: data.attributes.is_default,
});

export const rawDataToFileObject = (
	data: FractalResponseData<FileObjectAttributes>,
): FileObject => ({
	key: `${data.attributes.is_file ? "file" : "dir"}_${data.attributes.name}`,
	name: data.attributes.name,
	mode: data.attributes.mode,
	modeBits: data.attributes.mode_bits,
	size: Number(data.attributes.size),
	isFile: data.attributes.is_file,
	isSymlink: data.attributes.is_symlink,
	mimetype: data.attributes.mimetype,
	createdAt: new Date(data.attributes.created_at),
	modifiedAt: new Date(data.attributes.modified_at),

	isArchiveType: function () {
		return (
			this.isFile &&
			[
				"application/vnd.rar",
				"application/x-rar-compressed",
				"application/x-tar",
				"application/x-br",
				"application/x-bzip2",
				"application/gzip",
				"application/x-gzip",
				"application/x-lzip",
				"application/x-sz",
				"application/x-xz",
				"application/zstd",
				"application/zip",
				"application/x-7z-compressed",
			].indexOf(this.mimetype) >= 0
		);
	},

	isEditable: function () {
		if (this.isArchiveType() || !this.isFile) return false;

		const matches = [
			"application/jar",
			"application/octet-stream",
			"inode/directory",
			/^image\/(?!svg\+xml)/,
		];

		return matches.every((m) => !this.mimetype.match(m));
	},
});

export const rawDataToServerBackup = (
	data: FractalResponseData<ServerBackupAttributes>,
): ServerBackup => ({
	uuid: data.attributes.uuid,
	isSuccessful: data.attributes.is_successful,
	isLocked: data.attributes.is_locked,
	name: data.attributes.name,
	ignoredFiles: data.attributes.ignored_files,
	checksum: data.attributes.checksum,
	bytes: data.attributes.bytes,
	createdAt: new Date(data.attributes.created_at),
	completedAt: data.attributes.completed_at
		? new Date(data.attributes.completed_at)
		: null,
});

export const rawDataToServerEggVariable = (
	data: FractalResponseData<EggVariableAttributes>,
): ServerEggVariable => ({
	name: data.attributes.name,
	description: data.attributes.description,
	envVariable: data.attributes.env_variable,
	defaultValue: data.attributes.default_value,
	serverValue: data.attributes.server_value,
	isEditable: data.attributes.is_editable,
	rules: data.attributes.rules.split("|"),
});
