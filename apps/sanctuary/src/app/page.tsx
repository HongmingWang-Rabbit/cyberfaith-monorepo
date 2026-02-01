import { Button } from "@cyberfaith/ui";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center">
      <h1 className="text-5xl font-bold">
        <span className="text-primary">Sanctuary</span>
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        A community space for shared spiritual experiences and growth.
      </p>
      <Button size="lg">Join the Community</Button>
    </main>
  );
}
