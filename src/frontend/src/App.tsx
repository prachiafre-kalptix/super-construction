import { Toaster } from "@/components/ui/sonner";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { createRootRoute, createRoute } from "@tanstack/react-router";
import HomePage from "./pages/HomePage";
import SitePage from "./pages/SitePage";

const rootRoute = createRootRoute();

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const siteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/site/$siteId",
  component: SitePage,
});

const routeTree = rootRoute.addChildren([homeRoute, siteRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          classNames: {
            toast: "font-body",
          },
        }}
      />
    </>
  );
}
