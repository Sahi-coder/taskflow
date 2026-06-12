function Hero() {
  return (
    <section className="border-b bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-32 text-center">
        <h2 className="mb-6 text-6xl font-extrabold text-slate-900 md:text-7xl">
          Manage Your Projects
        </h2>

        <p className="mx-auto mb-10 max-w-3xl text-lg text-slate-500 md:text-2xl">
          Organize tasks and collaborate with your team.
        </p>

        <button className="rounded-xl bg-blue-600 px-10 py-4 text-lg font-medium text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl">
          Get Started
        </button>
      </div>
    </section>
  );
}

export default Hero;