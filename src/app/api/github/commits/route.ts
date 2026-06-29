import { NextRequest, NextResponse } from 'next/server';
import { githubApiService } from '@/services/github-api.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const repo = searchParams.get('repo');
    const branch = searchParams.get('branch') || undefined;
    const since = searchParams.get('since') || undefined;
    const until = searchParams.get('until') || undefined;
    const page = Number(searchParams.get('page') || 1);
    const perPage = Number(searchParams.get('perPage') || 30);

    if (!repo) {
      return NextResponse.json(
        { success: false, error: "Repository parameter 'repo' is required", code: 400 },
        { status: 400 },
      );
    }

    if (!/^[^/]+\/[^/]+$/.test(repo)) {
      return NextResponse.json(
        { success: false, error: 'Repository must be in owner/name format', code: 422 },
        { status: 422 },
      );
    }

    let result;
    if (branch) {
      result = await githubApiService.listCommits(
        repo,
        branch,
        since,
        until,
        page,
        perPage,
      );
    } else {
      result = await githubApiService.listAllBranchCommits(
        repo,
        since,
        until,
        page,
        perPage,
      );
    }

    return NextResponse.json(result, {
      status: result.success ? 200 : result.code || 500,
    });
  } catch (error) {
    console.error('[github-commits] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
