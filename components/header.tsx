export default function Header() {
  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">🏠</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Da Nang House Price</h1>
            <p className="text-sm text-muted-foreground">AI-Powered Real Estate Predictor</p>
          </div>
        </div>
      </div>
    </header>
  )
}
