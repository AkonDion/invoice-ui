export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden relative">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/Grid%202.png)" }}
      />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-8 px-4 space-y-6">
        <div className="bg-card/80 backdrop-blur-sm rounded-lg p-8 shadow-lg max-w-2xl w-full">
          <h1 className="text-4xl font-bold mb-4 text-foreground text-center">
            Welcome to ComfortHub Billing
          </h1>
          <p className="text-lg text-muted-foreground text-center">
            Please use a valid invoice link to access your billing information.
          </p>
        </div>
      </div>
    </div>
  )
}
