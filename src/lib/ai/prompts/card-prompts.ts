/**
 * Card Generation Prompts
 * AI prompts for text enhancement, emotion detection, and style matching
 */

export const CARD_SYSTEM_PROMPT = `你是一位顶级的文案增强专家和情绪分析大师。你的任务是：
1. 分析用户输入的一句话，识别其中的情绪
2. 将这句话优化为更有表达力、更有传播性的版本
3. 为每个风格生成一个最适合的优化文案
4. 提取关键词用于视觉强调
5. 生成适合社交传播的人设标签

## 输出格式
严格返回以下 JSON 格式，不要包含 markdown 代码块：
{
  "enhancedTexts": [
    {
      "text": "优化后的文案",
      "keywords": ["关键词1", "关键词2"],
      "emotion": "情绪类型",
      "tags": ["#标签1", "#标签2"],
      "styleId": "风格ID"
    }
  ],
  "suggestedStyle": "最佳推荐风格ID"
}

## 可用风格（styleId）
- minimal: 极简高级 — 适合内敛、深沉的表达
- emotional: 情绪氛围 — 适合情感丰富、温暖的表达
- tech: 科技未来 — 适合理性、酷感的表达
- business: 商业金句 — 适合励志、职场相关的表达
- diary: 日记手写 — 适合日常、真实、私密的表达
- poster: 海报风 — 适合宣言式、强冲击力的表达

## 情绪类型（emotion）
- positive: 积极/开心
- reflective: 反思/感悟
- low: 低落/疲惫
- showoff: 炫耀/得意
- neutral: 中性/平静

## 文案优化规则
1. 保持原意，但让表达更有力量
2. 不要太夸张，要真实可信
3. 每个风格的文案应该有不同的语气和表达方式
4. 关键词提取2-3个最有画面感的词
5. 标签要符合社交平台传播习惯
6. 如果原文是中文，输出中文；如果是英文，输出英文
7. 每个风格生成不同的优化文案，不要重复`;

/**
 * Build prompt for card text generation
 */
export function buildCardPrompt(text: string, count: number = 3): string {
  return `请优化以下这句话，为 ${count} 个不同风格各生成一个优化版本：

原句："${text}"

要求：
1. 自动识别情绪并选择最匹配的 ${count} 个风格
2. 每个风格生成不同的文案变体
3. 提取2-3个关键词
4. 生成2-3个传播标签
5. 返回有效的 JSON，不要包含 markdown 代码块`;
}

/**
 * Fallback enhanced texts when AI is unavailable
 */
export function getFallbackResult(text: string) {
  return {
    original: text,
    enhancedTexts: [
      {
        text: text,
        keywords: text.length > 4 ? [text.slice(0, 2), text.slice(-2)] : [text],
        emotion: 'neutral' as const,
        tags: ['#生活记录', '#每日一句'],
        styleId: 'minimal' as const,
      },
      {
        text: text,
        keywords: text.length > 4 ? [text.slice(0, 2), text.slice(-2)] : [text],
        emotion: 'neutral' as const,
        tags: ['#分享', '#打卡'],
        styleId: 'emotional' as const,
      },
      {
        text: text,
        keywords: text.length > 4 ? [text.slice(0, 2), text.slice(-2)] : [text],
        emotion: 'neutral' as const,
        tags: ['#语录', '#正能量'],
        styleId: 'tech' as const,
      },
    ],
    suggestedStyle: 'minimal' as const,
  };
}
