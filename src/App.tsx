import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { AuthProvider } from "./auth/AuthContext";
import { Suspense } from "react";

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </AuthProvider>
  );
}
