// This wraps all /training-hub/* pages with shared header + subnav
export default function TrainingHubLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex flex-col">
        {/* Removed Training Hub heading and green nav row */}
        <div className="px-8 py-6">
          {children}
        </div>
      </div>
    );
  }
  