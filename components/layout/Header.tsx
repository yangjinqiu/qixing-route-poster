'use client';

export default function Header() {
  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🚴</span>
          <h1 className="text-base font-medium text-gray-800">骑行 · 线路九宫格</h1>
        </div>
        <span className="text-xs text-gray-400">让每一条线路都被看见</span>
      </div>
    </header>
  );
}
