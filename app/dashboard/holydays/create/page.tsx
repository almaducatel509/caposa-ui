import RegisterForm from "@/app/components/holydays/register_form"
export default function HollydaysForm() {
    return(
    <main className="w-full bg-white">
        <div className="text-2xl font-semibold">Create Holyday</div>
        <div className="bg-white mt-12">
            <RegisterForm />
        </div>   
     </main>

    )
}