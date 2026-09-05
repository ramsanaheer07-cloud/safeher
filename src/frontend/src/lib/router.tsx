import { Layout } from "@/components/Layout";
import { ChatPage } from "@/pages/ChatPage";
import { CheckInPage } from "@/pages/CheckInPage";
import { ContactsPage } from "@/pages/ContactsPage";
import { DiscreetModePage } from "@/pages/DiscreetModePage";
import { FakeCallPage } from "@/pages/FakeCallPage";
import { HomePage } from "@/pages/HomePage";
import { ResourcesPage } from "@/pages/ResourcesPage";
import { SafetyToolsPage } from "@/pages/SafetyToolsPage";
import { SosPage } from "@/pages/SosPage";
import { TimerPage } from "@/pages/TimerPage";
import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: Layout,
});

const homeRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: HomePage,
});

const sosRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/sos",
  component: SosPage,
});

const checkInRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/check-in",
  component: CheckInPage,
});

const contactsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/contacts",
  component: ContactsPage,
});

const timerRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/timer",
  component: TimerPage,
});

const resourcesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/resources",
  component: ResourcesPage,
});

const chatRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/chat",
  component: ChatPage,
});

const fakeCallRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/fake-call",
  component: FakeCallPage,
});

const discreetRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/discreet",
  component: DiscreetModePage,
});

const safetyToolsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/safety-tools",
  component: SafetyToolsPage,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    homeRoute,
    sosRoute,
    contactsRoute,
    timerRoute,
    resourcesRoute,
    chatRoute,
    fakeCallRoute,
    discreetRoute,
    safetyToolsRoute,
    checkInRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
