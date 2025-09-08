import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirect to a sample invoice for demonstration
  // In production, this would redirect to a proper invoice selection page
  redirect("/invoice/8ae0161ec777ad250da6e3")
}
