import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'dashboard',
};


export default async function Page() {

  return (
    <main>
      <h1 className={` mb-4 text-xl md:text-2xl`}>
        my Dashboard Y
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* <CardWrapper /> */}
      
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
          {/* <RevenueChart /> */}
          {/* <LatestInvoices /> */}
      </div>
    </main>
  );
}