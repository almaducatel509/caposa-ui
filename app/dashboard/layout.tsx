import SideNav from '@/app/components/dashboard/sidenav';
 
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="{inter.variable} flex h-screen flex-col md:flex-row md:overflow-hidden  bg-white">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex-grow px-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}
