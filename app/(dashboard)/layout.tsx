export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/40 p-4">
        <p className="text-sm font-medium text-muted-foreground">Sidebar</p>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
