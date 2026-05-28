# AI 面试教练 · Vercel 部署指南

## 文件结构

```
ai-interview-coach/
├── api/
│   └── chat.js        ← 服务端代理，保护 API Key，解决 CORS
├── public/
│   └── index.html     ← 前端页面
└── vercel.json        ← Vercel 路由配置
```

## 部署步骤

### 1. 上传到 GitHub

```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/你的用户名/ai-interview-coach.git
git push -u origin main
```

### 2. 导入到 Vercel

1. 打开 https://vercel.com → 登录
2. 点击 **Add New → Project**
3. 选择刚才的 GitHub 仓库 → 点击 **Import**
4. Framework Preset 选 **Other**，其余默认 → 点击 **Deploy**

### 3. 配置 API Key（关键！）

部署完成后：
1. 进入项目 → **Settings → Environment Variables**
2. 添加一条：
   - Name：`ANTHROPIC_API_KEY`
   - Value：`sk-ant-xxxxxxxxxxxxxxxx`（你的 Anthropic API Key）
3. 点击 **Save**
4. 回到 **Deployments** → 点击最新部署旁边的 **...** → **Redeploy**

### 4. 访问

Vercel 会分配一个域名，格式类似：
`https://ai-interview-coach-xxx.vercel.app`

---

## 为什么用 Vercel 而不是 GitHub Pages？

| | GitHub Pages | Vercel |
|---|---|---|
| 支持静态 HTML | ✅ | ✅ |
| 解决 CORS | ❌ | ✅（通过 /api 代理） |
| 保护 API Key | ❌（Key 会暴露在源码） | ✅（Key 存在环境变量） |
| 免费 | ✅ | ✅ |
