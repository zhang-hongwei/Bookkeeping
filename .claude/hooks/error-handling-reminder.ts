#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface HookInput {
    session_id: string;
    transcript_path: string;
    cwd: string;
    permission_mode: string;
    hook_event_name: string;
}

interface EditedFile {
    path: string;
    tool: string;
    timestamp: string;
}

function getFileCategory(filePath: string): 'backend' | 'frontend' | 'database' | 'other' {
    // Frontend detection
    if (filePath.includes('/src/components/') ||
        filePath.includes('/src/features/') ||
        filePath.includes('/src/app/') && filePath.includes('page.tsx')) return 'frontend';

    // Backend detection (Next.js API routes & services)
    if (filePath.includes('/src/app/api/') ||
        filePath.includes('/src/services/') ||
        filePath.includes('/src/repositories/')) return 'backend';

    // Database detection
    if (filePath.includes('/src/database/') ||
        filePath.includes('/drizzle/') ||
        filePath.match(/\.sql$/)) return 'database';

    return 'other';
}

function shouldCheckErrorHandling(filePath: string): boolean {
    // Skip test files, config files, and type definitions
    if (filePath.match(/\.(test|spec)\.(ts|tsx)$/)) return false;
    if (filePath.match(/\.(config|d)\.(ts|tsx)$/)) return false;
    if (filePath.includes('/types/')) return false;
    if (filePath.includes('.styles.ts')) return false;

    // Check for code files
    return filePath.match(/\.(ts|tsx|js|jsx)$/) !== null;
}

function analyzeFileContent(filePath: string): {
    hasTryCatch: boolean;
    hasAsync: boolean;
    hasDrizzle: boolean;
    hasApiRoute: boolean;
    hasApiCall: boolean;
    hasService: boolean;
} {
    if (!existsSync(filePath)) {
        return {
            hasTryCatch: false,
            hasAsync: false,
            hasDrizzle: false,
            hasApiRoute: false,
            hasApiCall: false,
            hasService: false
        };
    }

    const content = readFileSync(filePath, 'utf-8');

    return {
        hasTryCatch: /try\s*\{/.test(content),
        hasAsync: /async\s+/.test(content),
        hasDrizzle: /db\.(select|insert|update|delete)|drizzle|pgTable/i.test(content),
        hasApiRoute: /NextRequest|NextResponse|export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)/.test(content),
        hasApiCall: /fetch\(|axios\.|apiClient\./i.test(content),
        hasService: /class.*Service|export\s+const\s+\w+Service/.test(content),
    };
}

async function main() {
    try {
        // Read input from stdin
        const input = readFileSync(0, 'utf-8');
        const data: HookInput = JSON.parse(input);

        const { session_id } = data;
        const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

        // Check for edited files tracking
        const cacheDir = join(process.env.HOME || '/root', '.claude', 'tsc-cache', session_id);
        const trackingFile = join(cacheDir, 'edited-files.log');

        if (!existsSync(trackingFile)) {
            // No files edited this session, no reminder needed
            process.exit(0);
        }

        // Read tracking data
        const trackingContent = readFileSync(trackingFile, 'utf-8');
        const editedFiles = trackingContent
            .trim()
            .split('\n')
            .filter(line => line.length > 0)
            .map(line => {
                const [timestamp, tool, path] = line.split('\t');
                return { timestamp, tool, path };
            });

        if (editedFiles.length === 0) {
            process.exit(0);
        }

        // Categorize files
        const categories = {
            backend: [] as string[],
            frontend: [] as string[],
            database: [] as string[],
            other: [] as string[],
        };

        const analysisResults: Array<{
            path: string;
            category: string;
            analysis: ReturnType<typeof analyzeFileContent>;
        }> = [];

        for (const file of editedFiles) {
            if (!shouldCheckErrorHandling(file.path)) continue;

            const category = getFileCategory(file.path);
            categories[category].push(file.path);

            const analysis = analyzeFileContent(file.path);
            analysisResults.push({ path: file.path, category, analysis });
        }

        // Check if any code that needs error handling was written
        const needsAttention = analysisResults.some(
            ({ analysis }) =>
                analysis.hasTryCatch ||
                analysis.hasAsync ||
                analysis.hasDrizzle ||
                analysis.hasApiRoute ||
                analysis.hasApiCall ||
                analysis.hasService
        );

        if (!needsAttention) {
            // No risky code patterns detected, skip reminder
            process.exit(0);
        }

        // Display reminder
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 错误处理自查清单 / ERROR HANDLING SELF-CHECK');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Backend reminders
        if (categories.backend.length > 0) {
            const backendFiles = analysisResults.filter(f => f.category === 'backend');
            const hasTryCatch = backendFiles.some(f => f.analysis.hasTryCatch);
            const hasDrizzle = backendFiles.some(f => f.analysis.hasDrizzle);
            const hasApiRoute = backendFiles.some(f => f.analysis.hasApiRoute);
            const hasService = backendFiles.some(f => f.analysis.hasService);

            console.log('⚠️  Backend 代码变更 / Backend Changes Detected');
            console.log(`   ${categories.backend.length} 个文件被修改 / file(s) edited\n`);

            if (hasTryCatch) {
                console.log('   ❓ 是否在 catch 块中添加了错误记录？');
                console.log('      Did you add error logging in catch blocks?');
            }
            if (hasDrizzle) {
                console.log('   ❓ Drizzle 操作是否包裹在错误处理中？');
                console.log('      Are Drizzle operations wrapped in error handling?');
            }
            if (hasApiRoute) {
                console.log('   ❓ API 路由是否返回规范的错误响应？');
                console.log('      Do API routes return standardized error responses?');
            }
            if (hasService) {
                console.log('   ❓ Service 层错误是否正确抛出？');
                console.log('      Are Service layer errors properly thrown?');
            }

            console.log('\n   💡 后端最佳实践 / Backend Best Practice:');
            console.log('      - API 路由统一返回 { error: string, details?: any }');
            console.log('      - Service 层抛出带有上下文的错误');
            console.log('      - 数据库操作必须包裹 try-catch');
            console.log('      - 使用适当的 HTTP 状态码（400, 404, 500 等）\n');
        }

        // Frontend reminders
        if (categories.frontend.length > 0) {
            const frontendFiles = analysisResults.filter(f => f.category === 'frontend');
            const hasApiCall = frontendFiles.some(f => f.analysis.hasApiCall);
            const hasTryCatch = frontendFiles.some(f => f.analysis.hasTryCatch);

            console.log('💡 Frontend 代码变更 / Frontend Changes Detected');
            console.log(`   ${categories.frontend.length} 个文件被修改 / file(s) edited\n`);

            if (hasApiCall) {
                console.log('   ❓ API 调用是否显示用户友好的错误消息？');
                console.log('      Do API calls show user-friendly error messages?');
            }
            if (hasTryCatch) {
                console.log('   ❓ 错误是否展示给用户？');
                console.log('      Are errors displayed to the user?');
            }

            console.log('\n   💡 前端最佳实践 / Frontend Best Practice:');
            console.log('      - 使用 Toast 组件显示错误');
            console.log('      - 异步操作添加 loading 状态');
            console.log('      - 显示用户可理解的错误信息');
            console.log('      - 组件错误使用 Error Boundary\n');
        }

        // Database reminders
        if (categories.database.length > 0) {
            console.log('🗄️  数据库变更 / Database Changes Detected');
            console.log(`   ${categories.database.length} 个文件被修改 / file(s) edited\n`);
            console.log('   ❓ 是否验证了列名与 schema 一致？');
            console.log('      Did you verify column names against schema?');
            console.log('   ❓ Schema 变更是否创建了 migration？');
            console.log('      Did you create migrations for schema changes?');
            console.log('   ❓ 是否测试了迁移脚本？');
            console.log('      Are migrations tested?\n');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('💡 TIP: 使用 SKIP_ERROR_REMINDER=1 禁用提醒');
        console.log('    Use SKIP_ERROR_REMINDER=1 to disable');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (err) {
        // Silently fail - this is just a reminder, not critical
        process.exit(0);
    }
}

main().catch(() => process.exit(0));
