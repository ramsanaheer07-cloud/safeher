import {
  type RouteComponent,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render } from "@testing-library/react";

/**
 * Render a component inside a minimal TanStack Router so `Link`/`SosButton`
 * (which read router context) work in isolation. `path` is the route the
 * component is mounted at (the router starts on that path); `links` are extra
 * routes the component may link to.
 */
export function renderWithRouter(
  Component: RouteComponent,
  path = "/",
  links: { path: string; component: RouteComponent }[] = [],
) {
  const rootRoute = createRootRoute();
  const route = createRoute({
    getParentRoute: () => rootRoute,
    path,
    component: Component,
  });
  const children = [
    route,
    ...links.map((link) =>
      createRoute({
        getParentRoute: () => rootRoute,
        path: link.path,
        component: link.component,
      }),
    ),
  ];
  const router = createRouter({
    routeTree: rootRoute.addChildren(children),
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  return render(<RouterProvider router={router} />);
}
