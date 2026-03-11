import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <p className="text-xl font-semibold">Page not found</p>
      <p className="text-sm text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Button asChild>
        <Link to="/dashboard">Go to Dashboard</Link>
      </Button>
    </div>
  );
}
