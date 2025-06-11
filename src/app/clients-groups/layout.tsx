import { HeaderSection } from "@/components/HeaderSection";

export default function ClientsGroupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col w-full bg-gray-50 min-h-screen">
      <HeaderSection />
      <div className="flex-1">{children}</div>
    </div>
  );
}

