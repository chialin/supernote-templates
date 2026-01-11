export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-8 px-16 bg-white dark:bg-black">
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
          Supernote Templates
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 text-center max-w-md">
          A collection of templates designed for Supernote e-ink devices.
          Browse and download templates for Nomad (A6 X2) and Manta (A5 X2).
        </p>
      </main>
    </div>
  );
}
