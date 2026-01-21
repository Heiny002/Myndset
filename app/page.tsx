export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fafafa]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#27272a] bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#00ff88]" />
            <span className="text-xl font-bold tracking-tight">Myndset</span>
          </div>
          <a
            href="#get-started"
            className="rounded-full bg-[#00ff88] px-4 py-2 text-sm font-semibold text-[#0a0a0a] transition-all hover:bg-[#00cc6a] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative">
        {/* Gradient background effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#00ff88]/10 blur-[120px]" />
        </div>

        <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 pt-16 text-center sm:px-6">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#27272a] bg-[#0a0a0a] px-4 py-1.5 text-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#00ff88]" />
            <span className="text-[#a1a1aa]">AI-Powered Performance Tool</span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Meditation for{' '}
            <span className="bg-gradient-to-r from-[#00ff88] to-[#00cc6a] bg-clip-text text-transparent">
              Boardrooms
            </span>
            , Not Yoga Studios
          </h1>

          {/* Subheadline */}
          <p className="mb-10 max-w-2xl text-lg text-[#a1a1aa] sm:text-xl">
            Unlock your competitive edge with AI-generated meditation scripts tailored to your
            goals. Close deals. Win competitions. Nail presentations.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row" id="get-started">
            <a
              href="/questionnaire"
              className="inline-flex h-14 items-center justify-center rounded-full bg-[#00ff88] px-8 text-lg font-semibold text-[#0a0a0a] transition-all hover:bg-[#00cc6a] hover:shadow-[0_0_30px_rgba(0,255,136,0.4)]"
            >
              Get Your Free Personalized Meditation
            </a>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex flex-col items-center gap-4">
            <p className="text-sm text-[#a1a1aa]">Trusted by ambitious professionals</p>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="h-5 w-5 fill-[#00ff88]"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-2 text-[#a1a1aa]">5.0</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Your Mental Edge, Engineered</h2>
            <p className="text-lg text-[#a1a1aa]">
              Performance meditation designed for high-achievers
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-2xl border border-[#27272a] bg-[#0a0a0a] p-8 transition-all hover:border-[#00ff88]/50">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#00ff88]/10">
                <svg
                  className="h-6 w-6 text-[#00ff88]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">AI Personalization</h3>
              <p className="text-[#a1a1aa]">
                Answer a few questions, get a meditation script uniquely crafted for your
                challenges and goals.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl border border-[#27272a] bg-[#0a0a0a] p-8 transition-all hover:border-[#00ff88]/50">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#00ff88]/10">
                <svg
                  className="h-6 w-6 text-[#00ff88]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">State-Specific Sessions</h3>
              <p className="text-[#a1a1aa]">
                High-energy before a pitch? Laser-focused for deep work? Get the right mental state
                when you need it.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl border border-[#27272a] bg-[#0a0a0a] p-8 transition-all hover:border-[#00ff88]/50">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#00ff88]/10">
                <svg
                  className="h-6 w-6 text-[#00ff88]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Goal-Oriented Results</h3>
              <p className="text-[#a1a1aa]">
                Track your progress and see real improvements in focus, decision-making, and
                performance under pressure.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">How It Works</h2>
            <p className="text-lg text-[#a1a1aa]">Three steps to your personalized edge</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#00ff88] text-xl font-bold text-[#0a0a0a]">
                1
              </div>
              <h3 className="mb-2 text-xl font-semibold">Take the Assessment</h3>
              <p className="text-[#a1a1aa]">
                Answer 8 quick questions about your goals, challenges, and mental patterns.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#00ff88] text-xl font-bold text-[#0a0a0a]">
                2
              </div>
              <h3 className="mb-2 text-xl font-semibold">AI Generates Your Script</h3>
              <p className="text-[#a1a1aa]">
                Our AI analyzes your responses and creates a meditation script tailored to your
                unique profile.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#00ff88] text-xl font-bold text-[#0a0a0a]">
                3
              </div>
              <h3 className="mb-2 text-xl font-semibold">Listen & Perform</h3>
              <p className="text-[#a1a1aa]">
                Professional audio delivered to your library. Use it before big moments or daily
                practice.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-[#27272a] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] p-8 sm:p-12 md:p-16">
            <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#00ff88]/20 blur-[100px]" />
            <div className="relative text-center">
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Ready to Gain Your Edge?</h2>
              <p className="mb-8 text-lg text-[#a1a1aa]">
                Your first personalized meditation is free. No credit card required.
              </p>
              <a
                href="/questionnaire"
                className="inline-flex h-14 items-center justify-center rounded-full bg-[#00ff88] px-8 text-lg font-semibold text-[#0a0a0a] transition-all hover:bg-[#00cc6a] hover:shadow-[0_0_30px_rgba(0,255,136,0.4)]"
              >
                Get Your Free Personalized Meditation
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#27272a] py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-[#00ff88]" />
                <span className="font-semibold">Myndset</span>
              </div>
              <p className="text-sm text-[#a1a1aa]">
                &copy; {new Date().getFullYear()} Myndset. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
