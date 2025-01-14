import { PullRequest, PullRequestState } from '../../git/models';
import type { RichRemoteProvider } from '../../git/remotes/provider';

export interface GitLabUser {
	id: number;
	name: string;
	username: string;
	publicEmail: string | undefined;
	state: string;
	avatarUrl: string | undefined;
	webUrl: string;
}

export interface GitLabCommit {
	id: string;
	short_id: string;
	created_at: Date;
	parent_ids: string[];
	title: string;
	message: string;
	author_name: string;
	author_email: string;
	authored_date: Date;
	committer_name: string;
	committer_email: string;
	committed_date: Date;
	status: string;
	project_id: number;
}

export interface GitLabIssue {
	iid: string;
	author: {
		name: string;
		avatarUrl: string | null;
		webUrl: string;
	} | null;
	title: string;
	description: string;
	createdAt: string;
	updatedAt: string;
	closedAt: string;
	webUrl: string;
	state: 'opened' | 'closed' | 'locked';
}

export interface GitLabMergeRequest {
	iid: string;
	author: {
		name: string;
		avatarUrl: string | null;
		webUrl: string;
	} | null;
	title: string;
	description: string | null;
	state: GitLabMergeRequestState;
	createdAt: string;
	updatedAt: string;
	mergedAt: string | null;
	webUrl: string;
}

export enum GitLabMergeRequestState {
	OPEN = 'opened',
	CLOSED = 'closed',
	MERGED = 'merged',
	LOCKED = 'locked',
}

export namespace GitLabMergeRequest {
	export function fromState(state: GitLabMergeRequestState): PullRequestState {
		return state === GitLabMergeRequestState.MERGED
			? PullRequestState.Merged
			: state === GitLabMergeRequestState.CLOSED || state === GitLabMergeRequestState.LOCKED
			? PullRequestState.Closed
			: PullRequestState.Open;
	}

	export function toState(state: PullRequestState): GitLabMergeRequestState {
		return state === PullRequestState.Merged
			? GitLabMergeRequestState.MERGED
			: state === PullRequestState.Closed
			? GitLabMergeRequestState.CLOSED
			: GitLabMergeRequestState.OPEN;
	}
}

export interface GitLabMergeRequestREST {
	id: number;
	iid: number;
	author: {
		name: string;
		avatar_url?: string;
		web_url: string;
	} | null;
	title: string;
	description: string;
	state: GitLabMergeRequestState;
	created_at: string;
	updated_at: string;
	closed_at: string | null;
	merged_at: string | null;
	web_url: string;
}

export namespace GitLabMergeRequestREST {
	export function from(pr: GitLabMergeRequestREST, provider: RichRemoteProvider): PullRequest {
		return new PullRequest(
			provider,
			{
				name: pr.author?.name ?? 'Unknown',
				avatarUrl: pr.author?.avatar_url ?? '',
				url: pr.author?.web_url ?? '',
			},
			String(pr.iid),
			pr.title,
			pr.web_url,
			GitLabMergeRequest.fromState(pr.state),
			new Date(pr.updated_at),
			pr.closed_at == null ? undefined : new Date(pr.closed_at),
			pr.merged_at == null ? undefined : new Date(pr.merged_at),
		);
	}
}
