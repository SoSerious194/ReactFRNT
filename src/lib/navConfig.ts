export const navConfig = {
  dashboard: {
    label: "Dashboard",
    subnav: [],
  },
  "clients-groups": {
    label: "Clients + Groups",
    subnav: [
      { label: "Clients", href: "/clients-groups/clients" },
      { label: "Groups", href: "/clients-groups/groups" },
    ],
  },
  "training-hub": {
    label: "Training Hub",
    subnav: [
      { label: "Program Library", href: "/program-library" },
      { label: "Workout Library", href: "/workout-library" },
      { label: "Exercise Library", href: "/exercise-library" },
      { label: "Video On-Demand", href: "/video-on-demand" },
      { label: "Forms & Questionnaires", href: "/forms" },
    ],
  },
  "nutrition-hub": {
    label: "Nutrition Hub",
    subnav: [],
  },
  inbox: {
    label: "Inbox",
    subnav: [],
  },
  "ai-flows": {
    label: "AI Flows",
    subnav: [],
  },
};
