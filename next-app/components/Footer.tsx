import Link from "next/link";

export default function Footer() {
  return (
    <footer role="contentinfo" className="bg-[#7db283] text-white py-10">
      <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Pages + Email */}
        <div>
          <h2 className="text-xl font-bold">Pages</h2>
          <ul className="mt-4 space-y-2">
            <li>
              <Link href="/" className="hover:underline">Home</Link>
            </li>
            <li>
              <Link href="/#features" className="hover:underline">About</Link>
            </li>
            <li>
              <Link href="/#contact" className="hover:underline">Contact Us</Link>
            </li>
          </ul>

          {/* Email */}
          <h3 className="mt-6 text-xl font-bold">Contact</h3>
          <a
            href="mailto:autogreensg@gmail.com"        
            className="underline hover:opacity-90"
          >
            autogreensg@gmail.com
          </a>
        </div>

        {/* Right: Social */}
        <div>
          <h2 className="text-xl font-bold">Follow Us</h2>
          <ul className="mt-4 flex space-x-6">
            <li>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="hover:text-gray-200"
                title="Facebook"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden="true">
                  <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24h11.495v-9.294H9.691v-3.622h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.504 0-1.796.715-1.796 1.763v2.31h3.59l-.467 3.622h-3.123V24h6.116c.73 0 1.324-.593 1.324-1.324V1.325C24 .593 23.407 0 22.675 0z" />
                </svg>
              </a>
            </li>

            <li>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-gray-200"
                title="Instagram"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 2.163c3.204 0 3.584.012 4.85.07 1.206.056 2.003.24 2.48.403a4.92 4.92 0 011.675.937c.486.486.78.964.937 1.675.163.477.347 1.274.403 2.48.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.056 1.206-.24 2.003-.403 2.48a4.92 4.92 0 01-.937 1.675c-.486.486-.964.78-1.675.937-.477.163-1.274.347-2.48.403-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.206-.056-2.003-.24-2.48-.403a4.92 4.92 0 01-1.675-.937c-.486-.486-.78-.964-.937-1.675-.163-.477-.347-1.274-.403-2.48C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.056-1.206.24-2.003.403-2.48a4.92 4.92 0 01.937-1.675c.486-.486.964-.78 1.675-.937.477-.163 1.274-.347 2.48-.403C8.416 2.175 8.796 2.163 12 2.163zm0 3.9a5.94 5.94 0 100 11.88A5.94 5.94 0 0012 6.063z"
                  />
                  <circle cx="12" cy="12" r="3.5" fill="currentColor" />
                  <path d="M18.406 5.594a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" fill="currentColor" />
                </svg>
              </a>
            </li>

            {/* WhatsApp */}
            <li>
              <a
                href="https://wa.me/6599999999" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="hover:text-gray-200"
                title="WhatsApp"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden="true">
                  {/* Simple WhatsApp */}
                  <path d="M12 2a10 10 0 0 0-8.94 14.5L2 22l5.7-1.96A10 10 0 1 0 12 2zm5.2 14.3c-.22.62-1.3 1.18-1.84 1.25-.49.06-1.1.09-3.2-.67-2.68-1.05-4.4-3.77-4.53-3.94-.13-.17-1.08-1.43-1.08-2.73 0-1.3.69-1.94.94-2.2.22-.23.59-.33.93-.33h.67c.2 0 .51.04.78.6.27.56.93 2.03 1.01 2.18.08.15.13.33.02.53-.11.2-.17.33-.34.51-.17.18-.36.4-.51.54-.17.17-.35.36-.15.69.2.33.9 1.48 1.98 2.4 1.36 1.12 2.52 1.47 2.87 1.64.35.17.56.15.77-.09.21-.24.88-1.03 1.12-1.39.24-.36.48-.3.8-.18.33.12 2.06.97 2.41 1.15.35.18.58.27.67.42.09.15.09.86-.13 1.48z" />
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-10 text-center text-sm text-gray-200">
        © {new Date().getFullYear()} AutoGreen. All rights reserved.
      </div>
    </footer>
  );
}
