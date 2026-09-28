# scripting-widgets

Scripting（iOS App）小组件集合仓库。

## 启动台 Launch

来源：[Honye/scripting-scripts](https://github.com/Honye/scripting-scripts/tree/main/scripts/Launch) v1.7.1（原作者 Jackie / Honye，MIT）

在原版基础上做了**全面中文化**（v1.7.2）：

- 应用 / 文件夹 / 设置三个页签及全部界面文案汉化
- App Store 搜索面板汉化（含地区列表中文名）
- 自定义按钮示例代码注释汉化，示例通知改为中文
- 保留技术术语原文：Bundle ID、URL Scheme、SF Symbol

### 用法

Scripting App → 从仓库/GitHub 导入本目录（`Launch/`），或直接把 `Launch/script.json` 所在文件夹导入。

### 目录结构

```
Launch/
├── script.json          # 脚本描述（中文名「启动台」）
├── index.tsx            # 应用入口（三页签）
├── widget.tsx           # 桌面小组件
├── SearchSheet.tsx      # App Store 搜索面板
├── buttonCode.ts        # 自定义按钮代码运行器
├── constants.ts         # 常量与数据模型
├── intent.tsx           # 快捷指令入口
├── app_intents.tsx      # App Intent（小组件点按交互）
└── components/          # 编辑器 / 文件夹视图 / 通用组件
```
