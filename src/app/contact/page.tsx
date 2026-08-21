export default function Contact() {
  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-10 py-14">
      <span className="badge-pill mb-5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
        Contact
      </span>
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">Get in touch</h1>
      <p className="text-[var(--muted)] text-[0.9375rem] leading-relaxed mb-10 max-w-lg">
        This is a solo-built project, so there isn&rsquo;t a support team behind it. For anything about Memvault
        itself, reach out directly.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <a href="https://x.com/gojo0204hm" target="_blank" rel="noopener noreferrer" className="card card-hover p-6 flex items-center gap-4">
          <span className="icon-badge shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
          </span>
          <p className="font-semibold text-[0.9375rem]">X (Twitter)</p>
        </a>

        <a href="https://t.me/gojo0204hm" target="_blank" rel="noopener noreferrer" className="card card-hover p-6 flex items-center gap-4">
          <span className="icon-badge accent shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21.94 3.36L18.5 20.13c-.26 1.15-.94 1.43-1.9.89l-5.26-3.88-2.54 2.44c-.28.28-.52.52-1.06.52l.38-5.36 9.76-8.82c.42-.38-.1-.59-.66-.21L6.13 12.4l-5.28-1.65c-1.15-.36-1.17-1.15.24-1.7L20.5 2.14c.96-.36 1.8.22 1.44 1.22z" /></svg>
          </span>
          <p className="font-semibold text-[0.9375rem]">Telegram</p>
        </a>
      </div>

      <div className="card p-6">
        <p className="text-sm font-semibold mb-3">Before reaching out</p>
        <ul className="flex flex-col gap-2 text-sm text-[var(--muted)]">
          <li>
            <a href="/support" className="text-[var(--primary)] font-medium">Support</a> covers the most common
            issues, especially anything about funding your wallet or your personal Shelby account.
          </li>
          <li>
            <a href="/docs" className="text-[var(--primary)] font-medium">Docs</a> explains how encryption, storage,
            and payments actually work under the hood.
          </li>
          <li>
            For anything about Shelby Protocol itself rather than Memvault, the{" "}
            <a href="https://docs.shelby.xyz/protocol" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] font-medium">Shelby docs</a>{" "}
            are the right place.
          </li>
        </ul>
      </div>
    </div>
  );
}
