# KoreEngine Worker 故障分级与自动恢复

## 故障分级（`kore-worker.mjs`）

| 级别 | 触发 | Worker 行为 | Host 行为 |
|---|---|---|---|
| 可恢复 | 参数转换、单条记录处理失败、单条输出超出队列槽等普通异常 | 记录并发出 `workerError`，继续处理后续消息；记录仍会回执，避免入口队列被堵死 | 只写控制台日志 |
| 致命 | `WebAssembly.RuntimeError`（Rust panic/trap）、内存或栈耗尽、初始化阶段失败、10 秒内 8 次可恢复错误（错误风暴） | 释放 Runtime，发出 `fault`（`fatal: true`、`reason`、`retryable`） | 自动重建 Worker |
| 不可重试 | 包与核心不匹配：`package-incompatible`、`boot-chunk-integrity-failed`、`boot-build-id-mismatch`、`core-chunk-size-mismatch`、`build-info-mismatch` | 同致命，但 `retryable: false` | 不自动重建，直接 `failed` |

定时器回调和未处理的 Promise 拒绝走同一套分级，不再变成无人处理的 Worker error。

## Host 自动重建（`kore-integration.mjs`）

- 10 分钟窗口内最多自动重建 3 次，等待 0.5s / 2s / 5s 递增。用尽后进入 `failed`，面板“重试”仍可手动重建（不受次数限制）。
- 重建时保留 LTSD 账号、`gameSession` 与地图连接信息，重新握手、重新绑定角色。

## 游戏进行中的会话恢复

新 Runtime 的世界状态是空的，而且收包流从中途开始，不能直接解析。恢复步骤：

1. **重新告知会话**：向新 Runtime 重发 `gameSessionStarted`（新的 gameSessionId）和 `mapConnectionStarted`（generation 不变，Online.js 持有的就是它）。
2. **重新对齐收包流**：`Online.js` 在转发数据时附带 `aligned`（原生接收缓冲没有半个包）。Host 丢弃未对齐的块，从第一个对齐的块开始转发。
3. **飞艇换图**：对齐后用私人飞艇（`PRIVATE_AIRSHIP_REQUEST`）前往 prontera；当前已在 prontera 则改去 payon，让服务器重新下发技能、背包和地图信息。当前地图来自 `globalThis.KoreEngineCurrentMap()`。
4. **恢复 AI**：世界就绪且配置加载完成（授权阶段为 `ready`）后，按崩溃前的模式发送 `ai auto` / `ai manual`。

任一步骤超时（换图后 30 秒世界仍未就绪）只记录警告，不会继续重试，需要玩家手动换图或重新登录。

## 已知限制

- 重建窗口内（数秒）发生的 `beginGameSession` / `beginMapConnection` 会被丢弃（与首次启动前的行为一致）。
- 飞艇需要道具；缺少道具或角色处于不能使用飞艇的状态时，恢复在 30 秒后放弃。
- 新实例与旧实例的 LTSD 许可冲突（单实例授权）未验证；若需要，可能要 `ai auto kick <实例 id>`。
