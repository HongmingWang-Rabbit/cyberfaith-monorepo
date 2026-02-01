export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="bg-background text-foreground min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <p className="text-muted-foreground">Page not found</p>
        </div>
      </body>
    </html>
  );
}
