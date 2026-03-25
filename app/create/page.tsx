import { CreatePostForm } from "@/components/create/create-post-form";

export default function CreatePage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <div className="mb-8 max-w-2xl">
        <p className="mb-3 text-sm uppercase tracking-[0.35em] text-white/50">
          Creator flow
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-white">
          Publish an app into the Rupture feed.
        </h1>
        <p className="mt-4 text-base leading-7 text-white/65">
          Paste your app URL, define the value clearly, and declare what support
          you need. Rupture is designed to make the live app itself the content.
        </p>
      </div>

      <CreatePostForm />
    </main>
  );
}
