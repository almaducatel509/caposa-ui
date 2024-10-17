// import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/components/search';
import {Post} from './columns';
import PostTable from '@/app/components/postes/PostTable';

async function getUsers(): Promise<Post[]> {
  const res = await fetch(
  'https://64a6f5fc096b3f0fcc80e3fa.mockapi.io/api/users'
)
  const data = await res.json()
  return data
}

export default async function Postes(){
 const postes = await getUsers()
    return (
      <div className="w-full bg-white">
        <div className="flex w-full items-center justify-between">
          <h1 className={` text-2xl`}>Postes</h1>
        </div>
        <div className="mt-4 mb-4 flex items-center justify-between gap-2 md:mt-8">
         {/* card */} 
        </div>
        <PostTable postes={postes} />

      </div>
    )
  }