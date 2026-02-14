export interface ModrinthPlugin {
	project_id: string;
	project_type: string;
	slug: string;
	author: string;
	title: string;
	description: string;
	categories: string[];
	display_categories: string[];
	versions: string[];
	downloads: number;
	follows: number;
	icon_url: string;
	date_created: string;
	date_modified: string;
	latest_version: string;
	license: string;
	client_side: string;
	server_side: string;
	gallery: string[];
	featured_gallery: string | null;
	color: number | null;
}

export interface ModrinthVersion {
	id: string;
	project_id: string;
	author_id: string;
	featured: boolean;
	name: string;
	version_number: string;
	changelog: string;
	changelog_url: string | null;
	date_published: string;
	downloads: number;
	version_type: "release" | "beta" | "alpha";
	status: string;
	requested_status: string | null;
	files: {
		id: string;
		hashes: {
			sha512: string;
			sha1: string;
		};
		url: string;
		filename: string;
		primary: boolean;
		size: number;
		file_type: string | null;
	}[];
	dependencies: any[];
	game_versions: string[];
	loaders: string[];
}

export interface ModrinthSearchResponse {
	hits: ModrinthPlugin[];
	total_hits: number;
	offset: number;
	limit: number;
}
