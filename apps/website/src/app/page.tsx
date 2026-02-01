import { Button } from "@cyberfaith/ui";
import { Card, CardHeader, CardTitle, CardContent } from "@cyberfaith/ui";
import Link from "next/link";

const apps = [
  { name: "Sanctum", description: "Your personal spiritual dashboard", href: "/products" },
  { name: "Destiny Loom", description: "Weave your path with guided journeys", href: "/products" },
  { name: "Sanctuary", description: "Community and shared experiences", href: "/products" },
];

export default function Home() {
  return (
    <main className="flex flex-col items-center">
      <section className="flex flex-col items-center justify-center gap-6 py-24 px-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
          Cyber<span className="text-primary">Faith</span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          A digital platform for spiritual growth, community, and personal transformation.
        </p>
        <div className="flex gap-4">
          <Link href="/products">
            <Button size="lg">Explore Apps</Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="lg">Learn More</Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-6 px-4 pb-24 sm:grid-cols-3 max-w-5xl w-full">
        {apps.map((app) => (
          <Card key={app.name}>
            <CardHeader>
              <CardTitle>{app.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{app.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
