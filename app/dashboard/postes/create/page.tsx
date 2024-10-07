import RegisterForm
 from "@/app/components/postes/register-form"
export default function MemberForm() {
    return(
    <main className="w-full bg-white">
        <div className="text-2xl font-semibold">Create Member</div>
        <div className="bg-white mt-12">
            <RegisterForm />
        </div>   
     </main>

    )
}