/**
 * Sitemap 测试页面
 * 用于查看生成的 sitemap 内容
 */

import { SitemapGenerator } from '@/lib/sitemap';

export default async function TestSitemapPage() {
  const generator = new SitemapGenerator();
  const sitemap = await generator.generate();

  // 统计信息
  const stats = {
    total: sitemap.length,
    byLanguage: {} as Record<string, number>,
    byPath: {} as Record<string, number>,
  };

  sitemap.forEach((entry) => {
    const url = new URL(entry.url);
    const path = url.pathname;

    // 统计语言
    const langMatch = path.match(/^\/(en-US|zh-TW|ja-JP)\//);
    const lang = langMatch ? langMatch[1] : 'zh-CN';
    stats.byLanguage[lang] = (stats.byLanguage[lang] || 0) + 1;

    // 统计路径类型
    if (path.includes('/blog/')) {
      stats.byPath['blog'] = (stats.byPath['blog'] || 0) + 1;
    } else if (path.includes('/product/')) {
      stats.byPath['product'] = (stats.byPath['product'] || 0) + 1;
    } else if (path.includes('/docs/')) {
      stats.byPath['docs'] = (stats.byPath['docs'] || 0) + 1;
    } else if (path.includes('/discover/')) {
      stats.byPath['discover'] = (stats.byPath['discover'] || 0) + 1;
    } else if (path.includes('/user/')) {
      stats.byPath['user'] = (stats.byPath['user'] || 0) + 1;
    } else if (path.includes('/category/')) {
      stats.byPath['category'] = (stats.byPath['category'] || 0) + 1;
    } else if (path.includes('/tag/')) {
      stats.byPath['tag'] = (stats.byPath['tag'] || 0) + 1;
    } else {
      stats.byPath['other'] = (stats.byPath['other'] || 0) + 1;
    }
  });

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace' }}>
      <h1 style={{ marginBottom: '20px' }}>Sitemap 测试页面</h1>

      {/* 统计信息 */}
      <div
        style={{
          background: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
        }}
      >
        <h2>📊 统计信息</h2>
        <p>
          <strong>总路由数：</strong>
          <span style={{ fontSize: '24px', color: '#1976d2', marginLeft: '10px' }}>
            {stats.total}
          </span>
        </p>

        <h3 style={{ marginTop: '20px' }}>按语言分布：</h3>
        <ul>
          {Object.entries(stats.byLanguage).map(([lang, count]) => (
            <li key={lang}>
              {lang}: <strong>{count}</strong> 个路由
            </li>
          ))}
        </ul>

        <h3 style={{ marginTop: '20px' }}>按类型分布：</h3>
        <ul>
          {Object.entries(stats.byPath).map(([type, count]) => (
            <li key={type}>
              {type}: <strong>{count}</strong> 个路由
            </li>
          ))}
        </ul>
      </div>

      {/* 前 50 个路由示例 */}
      <div>
        <h2>📝 前 50 个路由示例</h2>
        <div
          style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            maxHeight: '600px',
            overflow: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>
                  #
                </th>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>
                  URL
                </th>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>
                  优先级
                </th>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>
                  更新频率
                </th>
              </tr>
            </thead>
            <tbody>
              {sitemap.slice(0, 50).map((entry, index) => (
                <tr key={index}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{index + 1}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#1976d2', textDecoration: 'none' }}
                    >
                      {entry.url}
                    </a>
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {entry.priority || 'N/A'}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {entry.changeFrequency || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sitemap.length > 50 && (
          <p style={{ marginTop: '10px', color: '#666' }}>
            ... 还有 {sitemap.length - 50} 个路由（共 {sitemap.length} 个）
          </p>
        )}
      </div>

      {/* 访问实际 sitemap */}
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <a
          href="/sitemap.xml"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            background: '#1976d2',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '4px',
            textDecoration: 'none',
            fontSize: '16px',
          }}
        >
          查看实际 sitemap.xml
        </a>
      </div>
    </div>
  );
}
