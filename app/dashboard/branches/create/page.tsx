import RegisterForm
 from "@/app/components/branches/register-form"
export default function BrancheForm() {
    return(
    <main className="w-full bg-white">
        <div className="text-2xl font-semibold">Create branche</div>
        <div className="bg-white mt-12">
            <RegisterForm />
        </div>   
     </main>

    )
}