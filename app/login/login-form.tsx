"use client"
import { authenticate } from '@/app/lib/actions';
import { useSearchParams } from 'next/navigation';
import { useActionState, useState } from 'react';

// import { Loader2 } from 'react-icons/lu';

import { CircleAlert, Eye, EyeOff, Loader2, LockIcon, Mail } from 'lucide-react';

const LoginForm = () => {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
    const [errorMessage, formAction, isPending] = useActionState(
        authenticate,
        undefined,
    );
    const [show, setShow] = useState(false);

    const handleClick = () => setShow(!show);

    return (


        <section className="bg-gray-300 min-h-screen">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div className="flex items-center mb-6 text-2xl font-semibold text-gray-900 uppercase">

                    CAPOSA
                </div>
                <div className="w-full bg-white rounded-lg shadow  md:mt-0 sm:max-w-md xl:p-0">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                            Connectez-vous à votre compte
                        </h1>
                        <form action={formAction} className="space-y-4 md:space-y-6" >
                            <div>
                                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 ">Votre nom d&#39;utilisateur ou email</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Username ou email"
                                        id="username"
                                        name="username"
                                        required
                                        className="pl-10 pr-4 py-2 w-full bg-gray-100 text-black rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    />

                                    <Mail className="absolute top-3 left-3 text-gray-500" />

                                </div>
                            </div>
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">Mot de passe</label>
                                <div className="relative">
                                    <input
                                        type={show ? "text" : "password"}
                                        placeholder="Mot de passe"
                                        required

                                        name="password"
                                        id="password"
                                        minLength={6}
                                        className="pl-10 pr-4 py-2 w-full bg-gray-100 text-black rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    />

                                    <LockIcon className="absolute top-3 left-3 text-gray-500" />


                                    <button
                                        type="button"
                                        onClick={handleClick}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                                    >
                                        {show ? < EyeOff className="text-gray-500" /> : <Eye className="text-gray-500" />}

                                    </button>
                                </div>

                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input id="rememusernameber" aria-describedby="remember" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="remember" className="text-gray-900 ">Se souvenir de moi</label>
                                    </div>
                                </div>
                                <a href="#" className="text-sm font-medium text-gray-900 hover:underline">Mot de passe oublié ?</a>
                            </div>
                            <input type="hidden" name="redirectTo" value={callbackUrl} />
                            <button type="submit" className="w-full rounded-md bg-blue-500 py-2 px-4 text-white font-medium hover:bg-blue-600 flex justify-center items-center" disabled={isPending}>

                                Se connecter {isPending && <Loader2 className="animate-spin ml-2" />}


                            </button>
                            <p className="text-sm font-light text-gray-500">
                                Vous n’avez pas encore de compte ?  <a href="#" className="font-medium text-black hover:underline">Inscrivez-vous</a>
                            </p>
                            <div
                                className="flex h-8 items-end space-x-1"
                                aria-live="polite"
                                aria-atomic="true"
                            >
                                {errorMessage && (
                                    <>
                                        <CircleAlert className="h-5 w-5 text-red-500" />
                                        <p className="text-sm text-red-500">{errorMessage}</p>
                                    </>

                                )}
                            </div>

                        </form>
                    </div>
                </div >
            </div>
        </section>

    )
}

export default LoginForm
