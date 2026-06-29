
  主要用途：

  1. 并行开发：同时在多个分支上工作
  2. 避免分支切换：不需要频繁 git checkout
  3. 独立工作空间：每个 worktree 有自己的文件系统副本
  4. 共享同一个 .git：所有 worktree 共享同一个 git 历史和对象存储

  基本使用：

  # 创建新的 worktree 在特定分支
  git worktree add ../feature-branch feature-branch

  # 创建新的 worktree 并创建新分支
  git worktree add ../new-feature -b new-feature

  # 列出所有 worktree
  git worktree list

  # 删除 worktree
  git worktree remove ../feature-branch

  对于 Claude Code 的意义：

  你可以：
  - 在一个 worktree 中运行 Claude Code 处理 feature A
  - 在另一个 worktree 中运行另一个 Claude Code 实例处理 feature B
  - 每个会话独立工作，不会互相干扰

  这对于复杂的并行开发任务非常有用，特别是在需要同时处理多个功能或修复时。
