export default function Contact() {
  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-10 py-14">
      <span className="badge-pill mb-5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
        Contact
      </span>
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">Get in touch</h1>
      <p className="text-[var(--muted)] text-[0.9375rem] leading-relaxed mb-10 max-w-lg">
        This is a solo-built project, so there isn&rsquo;t a support team behind it, but here&rsquo;s where to go depending on what you need.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <a href="https://x.com/gojo0204hm" target="_blank" rel="noopener noreferrer" className="card card-hover p-6 flex flex-col gap-3 animate-in">
          <span className="icon-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
          </span>
          <div>
            <p className="font-semibold text-[0.9375rem]">X (Twitter)</p>
            <p className="text-sm text-[var(--muted)] mt-1">@gojo0204hm</p>
          </div>
        </a>

        <a href="https://t.me/gojo0204hm" target="_blank" rel="noopener noreferrer" className="card card-hover p-6 flex flex-col gap-3 animate-in delay-1">
          <span className="icon-badge accent">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21.94 3.36L18.5 20.13c-.26 1.15-.94 1.43-1.9.89l-5.26-3.88-2.54 2.44c-.28.28-.52.52-1.06.52l.38-5.36 9.76-8.82c.42-.38-.1-.59-.66-.21L6.13 12.4l-5.28-1.65c-1.15-.36-1.17-1.15.24-1.7L20.5 2.14c.96-.36 1.8.22 1.44 1.22z" /></svg>
          </span>
          <div>
            <p className="font-semibold text-[0.9375rem]">Telegram</p>
            <p className="text-sm text-[var(--muted)] mt-1">@gojo0204hm</p>
          </div>
        </a>

        <a href="mailto:hello@example.com" className="card card-hover p-6 flex flex-col gap-3 animate-in delay-2">
          <span className="icon-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
          </span>
          <div>
            <p className="font-semibold text-[0.9375rem]">Project questions</p>
            <p className="text-sm text-[var(--muted)] mt-1">For anything about this specific Memvault build.</p>
          </div>
        </a>

        <a href="https://docs.shelby.xyz/protocol" target="_blank" rel="noopener noreferrer" className="card card-hover p-6 flex flex-col gap-3 animate-in delay-3">
          <span className="icon-badge accent">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
          </span>
          <div>
            <p className="font-semibold text-[0.9375rem]">Shelby Protocol &amp; SDK</p>
            <p className="text-sm text-[var(--muted)] mt-1">For questions about the underlying storage network itself.</p>
          </div>
        </a>

        <a href="/support" className="card card-hover p-6 flex flex-col gap-3 animate-in delay-4">
          <span className="icon-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2 1.8-2 3.5M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </span>
          <div>
            <p className="font-semibold text-[0.9375rem]">Common issues</p>
            <p className="text-sm text-[var(--muted)] mt-1">Check the FAQ before reaching out. It covers most setup problems.</p>
          </div>
        </a>

        <a href="/docs" className="card card-hover p-6 flex flex-col gap-3 animate-in delay-5">
          <span className="icon-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
          </span>
          <div>
            <p className="font-semibold text-[0.9375rem]">How it works</p>
            <p className="text-sm text-[var(--muted)] mt-1">Read the docs for the encryption and marketplace architecture.</p>
          </div>
        </a>
      </div>
    </div>
  );
}
