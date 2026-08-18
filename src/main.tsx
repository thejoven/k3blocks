import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import '@fontsource/geist/400.css'
import '@fontsource/geist/500.css'
import '@fontsource/geist/600.css'
import '@fontsource/geist-mono/400.css'
import '@fontsource/geist-mono/500.css'
import './index.css'
import App from './App.tsx'

// HashRouter：纯静态托管下（无 SPA fallback）二级以上路由直达/刷新也能正确加载资源
createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <App />
  </HashRouter>,
)
