import { NextRequest, NextResponse } from 'next/server';
import { githubApiService } from '@/services/github-api.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const page = Number(searchParams.get('page') || 1);
    const perPage = Math.min(Number(searchParams.get('per_page') || 100), 100);

    if (!q) {
      const result = await githubApiService.listUserRepos(page, perPage);
      return NextResponse.json(result, {
        status: result.success ? 200 : result.code || 500,
      });
    }

    const result = await githubApiService.searchRepos(q, page, perPage);
    return NextResponse.json(result, {
      status: result.success ? 200 : result.code || 500,
    });
  } catch (error) {
    console.error('[github-repos] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
