import { Link, Outlet, useLocation } from "react-router-dom";

const navItems = [
  { path: "/", label: "홈", icon: "🏠" },
  { path: "/toto", label: "토토", icon: "🎰" },
  { path: "/awards", label: "시상식", icon: "🏆" },
  { path: "/hall", label: "전당", icon: "👑" },
  { path: "/profile", label: "통계", icon: "📊" },
  { path: "/timeline", label: "한마디", icon: "💬" },
  { path: "/history", label: "기록실", icon: "📜" },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <header className="bg-[var(--color-surface)] border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🌀</span>
              <h1 className="text-xl font-bold text-[var(--color-accent)]">
                과중력 공대
              </h1>
            </Link>

            {/* 네비게이션 */}
            <nav className="flex gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2
                      ${
                        isActive
                          ? "bg-[var(--color-primary)] text-white"
                          : "hover:bg-white/10 text-[var(--color-text-muted)]"
                      }`}
                  >
                    <span>{item.icon}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        <Outlet />
      </main>

      {/* 푸터 */}
      <footer className="bg-[var(--color-surface)] border-t border-white/10 py-4">
        <div className="max-w-5xl mx-auto px-4 text-center text-[var(--color-text-muted)] text-sm">
          과중력 공대 © 2026 • 아르카디아: 헤비급
        </div>
      </footer>
    </div>
  );
}
