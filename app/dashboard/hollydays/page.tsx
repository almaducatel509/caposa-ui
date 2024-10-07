// import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/components/search';
import {User} from './columns';
import HolydayTable from '@/app/components/hollydays/holydayTable';

async function getUsers(): Promise<User[]> {
  const res = await fetch(
  'https://64a6f5fc096b3f0fcc80e3fa.mockapi.io/api/users'
)
  const data = await res.json()
  return data
}

export default async function Users(){
 const users = await getUsers()
    return (
      <div className="w-full bg-white">
        <div className="flex w-full items-center justify-between">
          <h1 className={` text-2xl`}>Holydays</h1>
        </div>
        <div className="mt-4 mb-4 flex items-center justify-between gap-2 md:mt-8">
         {/* card */} 
        </div>
        <HolydayTable users={users} />
      </div>
    )
  }