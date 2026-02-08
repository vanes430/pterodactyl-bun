export interface AllocationAttributes {
	id: number;
	ip: string;
	ip_alias: string | null;
	port: number;
	notes: string | null;
	is_default: boolean;
}

export interface FileObjectAttributes {
	name: string;
	mode: string;
	mode_bits: string;
	size: number;
	is_file: boolean;
	is_symlink: boolean;
	mimetype: string;
	created_at: string;
	modified_at: string;
}

export interface ServerBackupAttributes {
	uuid: string;
	is_successful: boolean;
	is_locked: boolean;
	name: string;
	ignored_files: string;
	checksum: string;
	bytes: number;
	created_at: string;
	completed_at: string | null;
}

export interface EggVariableAttributes {
	name: string;
	description: string;
	env_variable: string;
	default_value: string;
	server_value: string | null;
	is_editable: boolean;
	rules: string;
}

export interface UserAttributes {
	uuid: string;
	username: string;
	email: string;
	image: string;
	"2fa_enabled": boolean;
	created_at: string;
}
