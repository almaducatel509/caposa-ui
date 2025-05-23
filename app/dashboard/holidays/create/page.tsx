import RegisterForm from "@/app/components/holidays/register_form"
export default function HolidaysForm() {
    return(
    <main className="w-full bg-white">
        <div className="text-2xl font-semibold">Create Holiday</div>
        <div className="bg-white mt-12">
            <RegisterForm />
        </div>   
     </main>

    )
}