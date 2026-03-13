/**
 * 푸터 컴포넌트
 */
export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 py-8 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            &copy; 2024 MetaLotto. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://explorer.metadium.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Metadium Explorer
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
