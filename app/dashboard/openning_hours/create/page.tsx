import RegisterForm from "@/app/components/OpeningHours/register_form"
export default function OpeningHourForm() {
    return(
    <main className="w-full bg-white">
        <div className="text-2xl font-semibold">Create Opening Hours</div>
        <div className="bg-white ">
            <RegisterForm />
        </div>   
     </main>

    )
}