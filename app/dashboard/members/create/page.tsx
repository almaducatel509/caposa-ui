import CreateForm from "@/app/components/members/createform"

export default function MemberForm() {
    return(
    <main className="w-full bg-white">
        <div className="text-2xl font-semibold">Create Member</div>
        <div className="bg-white mt-12">
            <CreateForm />
        </div>   
     </main>

    )
}