import RegisterForm from "@/app/components/branches/registration-form"
export default function BranchesForm() {
    return(
    <main className="w-full bg-white">
        <div className="text-2xl font-semibold">Create Branche</div>
        <div className="bg-white mt-12">
            <RegisterForm />
        </div>   
     </main>

    )
}