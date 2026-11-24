# CloudVault 2.0 design system

The original ink/slate interface uses semantic CSS variables in frontend/src/design.css for backgrounds, text, muted text, borders, accent, focus, success, warning and failure. Light, dark and operating-system theme preferences persist locally. Inter Variable is self-hosted through @fontsource-variable/inter; its license is retained in frontend/FONT_LICENSE.txt. Lucide provides existing consistent icons. No stock dashboard template or remote font service is used.

The shell has a 232px sidebar, a persistent 76px collapsed rail, a compact tablet rail and a mobile navigation dialog. Content uses consistent spacing, fine borders, restrained shadows and clear typographic levels. The overview pairs a knowledge entry with actual collection statistics; there are no invented storage quotas or activity graphs.

My Files offers list/grid, density, meaningful status/type filters, sorting, page selection, stars, source previews and actions in native dialogs. Upload shows actual transfer progress followed by actual indexing state. Search keeps four explicit modes. Ask CloudVault separates questions/answers from an evidence panel and makes generation, extraction and insufficient evidence visibly distinct.

Keyboard support includes Ctrl+K navigation/file search, Ctrl+Shift+U upload, Ctrl+Enter sending, Escape dialogs, skip link, visible focus and labeled icon controls. Native modal dialogs trap focus, lock background scrolling and restore focus. Narrow layouts wrap controls and move evidence below answers. Motion is restrained to opacity/transform and respects prefers-reduced-motion. Async work reports real elapsed time, never a fabricated completion percentage.

