export default function ProductsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-24">
      <h1 className="text-4xl font-bold mb-6">Our Products</h1>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold">Sanctum</h2>
          <p className="text-muted-foreground">Your personal spiritual dashboard and daily companion.</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Destiny Loom</h2>
          <p className="text-muted-foreground">Guided journeys to weave your spiritual path.</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Sanctuary</h2>
          <p className="text-muted-foreground">Community space for shared spiritual experiences.</p>
        </div>
      </div>
    </main>
  );
}
