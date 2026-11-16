# 奧捷匈 12 日旅行網站

以 Vue 3 + Vite 製作，行程以 `1151201奧捷匈12日`為主要依據。預算與清單資料使用瀏覽器 `localStorage` 暫時保存。

## 本機預覽

```bash
npm install
npm run dev
```

正式建置：

```bash
npm run build
npm run preview
```

## 修改內容

- 行程、住宿、餐食、地圖：`src/data.js`
- 畫面與功能：`src/App.vue`
- 色彩與版面：`src/style.css`

## GitHub Pages

1. 建立 GitHub repository 並將本資料夾推上去。
2. Repository → Settings → Pages → Source 選擇 **GitHub Actions**。
3. 推送到 `main` 後，工作流程會自動建置與部署。

由於 `vite.config.js` 使用 `base: './'`，可部署於任何 repository 名稱。
