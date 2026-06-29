# ⚠️ DEPRECATED - 已弃用

> **重要提示**: 此目录下的所有规则文件已被弃用，不应再使用。

## 📢 迁移通知

此目录下的前端开发规则已全面迁移到新的技能系统。

### 新的规范位置

请使用以下新规范文件：

✅ **主规范**: `.claude/skills/frontend-dev/SKILL.md`

这是当前唯一有效的前端开发规范文件，涵盖：
- React 组件开发规范
- MUI v6/v7 组件使用指南
- Tailwind CSS 样式规范
- 表单处理（react-hook-form + Zod）
- 图标系统（react-icons）
- 国际化（react-i18next）
- 布局系统（MUI Grid, Stack, Box）

## 📋 迁移映射表

旧规则文件与新技能系统的对应关系：

| 旧文件 (已弃用) | 新位置 | 说明 |
|----------------|--------|------|
| `ui-essentials.md` | `.claude/skills/frontend-dev/SKILL.md` | 核心规范已整合 |
| `styling.md` | `.claude/skills/frontend-dev/SKILL.md` | 样式规范已整合 |
| `component-conventions.md` | `.claude/skills/frontend-dev/SKILL.md` | 组件规范已整合 |
| `component-patterns.md` | `.claude/skills/frontend-dev/resources/component-patterns.md` | 已迁移到 resources |
| `component-organization.md` | `.claude/skills/frontend-dev/SKILL.md` | 组织规范已整合 |
| `layout-system.md` | `.claude/skills/frontend-dev/SKILL.md` | 布局规范已整合 |
| `form-development.md` | `.claude/skills/frontend-dev/SKILL.md` | 表单规范已整合 |
| `icon-system.md` | `.claude/skills/frontend-dev/SKILL.md` | 图标规范已整合 |
| `i18n.md` | `.claude/skills/frontend-dev/SKILL.md` | 国际化规范已整合 |
| `mui.md` | `.claude/skills/frontend-dev/resources/mui-integration.md` | MUI 工具说明 |

## 🚀 为什么要迁移？

新的技能系统提供：

1. **自动激活** - 编辑 .tsx 文件时自动加载相关规范
2. **统一管理** - 所有前端规范集中在一个地方
3. **更好的组织** - 主文件 + resources 目录，结构更清晰
4. **实时更新** - 技能系统会随着项目演进持续更新
5. **上下文感知** - 根据文件类型智能加载相关规范

## ⏰ 时间线

- **2025-10-15**: 新技能系统创建
- **2025-10-20**: 规则迁移完成
- **2025-11-01**: 旧规则标记为 DEPRECATED
- **2025-12-01**: 计划归档此目录（将移至 `.claude/rules/_archived/`）

## 📖 如何使用新系统

### 开发时

编辑 `.tsx` 文件时，frontend-dev 技能会自动激活，无需手动引用。

### 查阅规范时

直接查看以下文件：
```bash
# 主规范文件
.claude/skills/frontend-dev/SKILL.md

# 详细资源
.claude/skills/frontend-dev/resources/
├── component-patterns.md
├── form-patterns.md
├── state-management-integration.md
└── mui-integration.md
```

### 在 CLAUDE.md 中引用

```markdown
<!-- ❌ 旧方式 (已弃用) -->
See `.claude/rules/ui-frontend/ui-essentials.md`

<!-- ✅ 新方式 -->
See `.claude/skills/frontend-dev/SKILL.md`
```

## ❓ 常见问题

**Q: 这些旧规则还能用吗？**
A: 可以阅读作为参考，但不应作为开发依据。新规范可能已有更新。

**Q: 旧规则什么时候会被删除？**
A: 2025年12月左右归档到 `_archived/` 目录，不会完全删除。

**Q: 我正在进行的项目怎么办？**
A: 立即切换到新规范。两者内容基本一致，但新规范包含最新的最佳实践。

**Q: 如何报告新规范的问题？**
A: 直接修改 `.claude/skills/frontend-dev/SKILL.md` 或相关 resources 文件。

## 🔗 相关资源

- [Skills 系统说明](.claude/skills/README.md)
- [迁移指南](.claude/MIGRATION.md)
- [前端开发技能](.claude/skills/frontend-dev/SKILL.md)

---

**最后更新**: 2025-11-01
**维护者**: 项目团队
**状态**: ⚠️ DEPRECATED - 请使用新技能系统
