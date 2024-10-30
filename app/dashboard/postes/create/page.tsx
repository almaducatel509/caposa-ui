import RegisterForm
 from "@/app/components/postes/register-form"
export default function PostForm() {
    return(
    <main className="w-full bg-white">
        <div className="text-2xl font-semibold">Create Post</div>
        <div className="bg-white mt-12">
            <RegisterForm />
        </div>   
     </main>

    )
}