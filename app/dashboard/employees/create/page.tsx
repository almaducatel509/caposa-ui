import RegisterForm from "@/app/components/employees/register-form"
export default function EmployeeForm() {
    return(
    <main className="w-full bg-white">
        <div className="text-2xl font-semibold">Create Employee</div>
        <div className="bg-white mt-12">
            <RegisterForm />
        </div>   
     </main>

    )
}