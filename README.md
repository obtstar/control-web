# control-web

概要/外部设计见控制中心仓库 `control-center/docs/design/`；
内部设计位于本仓库 `docs/design/internal/`，与代码同分支、同 MR 提交。

## 包管理

统一使用 **pnpm**（多 worktree 并行任务共享全局 store，硬链接避免重复安装）：

```bash
corepack enable && corepack prepare pnpm@latest --activate
pnpm install
```
