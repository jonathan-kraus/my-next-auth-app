// lib/github.ts

/**
 * Resolve the commit SHA from different GitHub webhook event payloads.
 */
export function getSha(payload: any): string | undefined {
  return (
    payload.after || // push events
    payload.pull_request?.head?.sha || // PR events
    payload.workflow_run?.head_sha || // workflow_run events
    payload.check_suite?.head_sha || // check_suite events
    payload.check_run?.head_sha || // check_run events
    payload.sha // status/deployment events
  );
}

/**
 * Detect an all-zero or missing SHA (e.g. branch delete events).
 */
function isZeroSha(sha: string | undefined): boolean {
  return !sha || /^0{40}$/.test(sha);
}

/**
 * Get repository info from payload
 */
export function getRepoInfo(payload: any): {
  owner: string;
  repo: string;
} | null {
  const repository = payload.repository;
  if (!repository) return null;

  return {
    owner: repository.owner?.login || repository.owner?.name,
    repo: repository.name,
  };
}

/**
 * Resolve the commit message from payload or GitHub API fallback.
 */
export async function getCommitMessage(
  payload: any,
): Promise<string | undefined> {
  // First try to get message directly from payload
  let message =
    payload.head_commit?.message || // push events
    payload.pull_request?.title || // PR title
    payload.deployment?.description; // deployment description

  // Fallback: fetch commit message from GitHub API
  if (!message) {
    const sha = getSha(payload);
    const repoInfo = getRepoInfo(payload);

    // If SHA is missing or all zeros (branch delete / special events), skip API call
    if (!repoInfo || isZeroSha(sha)) {
      return message; // still undefined, and that's fine
    }

    try {
      const res = await fetch(
        `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/commits/${sha}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: "application/vnd.github+json",
          },
        },
      );

      if (res.ok) {
        const data = await res.json();
        message = data?.commit?.message;
      } else {
        console.error(`GitHub API error: ${res.status} ${await res.text()}`);
      }
    } catch (err) {
      console.error("Commit fetch failed:", err);
    }
  }

  return message;
}

/**
 * Get full commit details from GitHub API
 */
export async function getCommitDetails(
  owner: string,
  repo: string,
  sha: string,
): Promise<any> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
      },
    );

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${await res.text()}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Failed to get commit details:", error);
    throw error;
  }
}
