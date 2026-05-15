import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center max-w-sm px-4">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page not found</h1>
        <p className="text-gray-500 text-sm mb-6">The page you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/")} className="bg-green-600 hover:bg-green-700 text-white">
          Go home
        </Button>
      </div>
    </div>
  );
}
