import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '骑星 · 路线九宫格',
  description: '上传9张骑行照片，选择经典骑行路线模板，生成带路线轨迹的九宫格图片，一键分享朋友圈和小红书',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[#F8FAFC]">{children}</body>
    </html>
  );
}
