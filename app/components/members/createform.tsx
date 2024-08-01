'use client'

import { useState } from 'react'
import { z } from 'zod'
import { FormDataSchema } from '@/app/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form'
import {create} from '@/app/lib/create'
import {RadioGroup, Radio} from "@nextui-org/radio";
import {Select, SelectItem} from "@nextui-org/react";
// import { departments } from "@/app/lib/actions"; 


type Inputs = z.infer<typeof FormDataSchema>


const steps = [
  {
    id: 'Step 1',
    name: 'Personal Information',
    fields: ['firstName', 'lastName', 'email', 'date_of_birthday', 'gender', 'phone', 'address', 'ville', 'departement', 'image'] 
  },
  {
    id: 'Step 2',
    name: 'Caisse Info',
    fields: ['accountType', 'accountNumber', 'currentBalance', 'demandeSpecifique']
  },
  {
    id: 'Step 3',
    name: 'Complete'
  }
];


export default function CreateForm() {
  const [currentStep, setCurrentStep] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    trigger,
    formState: { errors }
  } = useForm<Inputs>({
    resolver: zodResolver(FormDataSchema)
  })

  const processForm: SubmitHandler<Inputs> = data => {
   console.log(data) 
    const formData = new FormData()
        formData.append('dob', data.dob)
        formData.append('firstName', data.firstName)
        formData.append('lastName', data.lastName)
        formData.append('email', data.email)
        formData.append('gender', data.gender || 'Unknown')
        formData.append('addresse', data.address)
        formData.append('ville', data.ville)
        formData.append('phone', data.phone)
        formData.append('departement', data.department)
        formData.append('accountType', data.accountType)
        formData.append('accountNumber', data.accountNumber)
        //change formData.append('demandeSpecifique', data.demandeSpecifique)
        if (data.identityPhoto) {
          formData.append('identityPhoto', data.identityPhoto);
        }
        console.log(formData)
        create(data)
        // reset()
    // call api
  }

  type FieldName = keyof Inputs

  const next = async () => {
    const fields = steps[currentStep].fields
    const output = await trigger(fields as FieldName[], { shouldFocus: true })

    if (!output) return

    if (currentStep < steps.length - 1) {
      if (currentStep === steps.length - 2) {
        await handleSubmit(processForm)()
      }
      setCurrentStep(step => step + 1)
    }
  }

    const prev = () => {
        if (currentStep > 0) {
        setCurrentStep(step => step - 1)
    }
  
  }

  return (
    <section className=' inset-0 flex flex-col justify-between'>
      {/* steps */}
      <nav aria-label='Progress'>
        <ol role='list' className='space-y-4 md:flex md:space-x-8 md:space-y-0'>
          {steps.map((step, index) => (
            <li key={step.name} className='md:flex-1'>
              {currentStep > index ? (
                <div className='group flex w-full flex-col border-l-4 border-pirncipalGreen py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'>
                  <span className='text-sm font-medium text-pirncipalGreen transition-colors '>
                    {step.id}
                  </span>
                  <span className='text-sm font-medium '>{step.name}</span>
                </div>
              ) : currentStep === index ? (
                <div
                  className='flex w-full flex-col border-l-4 border-pirncipalGreen py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'
                  aria-current='step'
                >
                  <span className='text-sm font-medium pb-[5px]  text-pirncipalGreen'>
                    {step.id}
                  </span>
                  <span className='text-sm font-medium'>{step.name}</span>
                </div>
              ) : (
                <div className='group flex w-full flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'>
                  <span className='text-sm font-medium text-gray-500 transition-colors pb-[5px] '>
                    {step.id}
                  </span>
                  <span className='text-sm font-medium'>{step.name}</span>
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>
      {/* Form */}
      <form action={create} className='mt-2 py-12'>
        {/*  */}
      </form>

      {/* Navigation */}
      <div className='mt-8 pt-5'>
        <div className='flex justify-between'>
          {/* previous */}
          <button
            type='button'
            onClick={prev}
            disabled={currentStep === 0}
            className='rounded bg-white px-2 py-1 text-sm font-semibold text-darkGreen shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-secGreen disabled:cursor-not-allowed disabled:opacity-50'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth='1.5'
              stroke='currentColor'
              className='h-6 w-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M15.75 19.5L8.25 12l7.5-7.5'
              />
            </svg>
          </button>
          {/* next */}
          <button
            type="submit"
            onClick={next}
            disabled={currentStep === steps.length - 1}
            className='rounded bg-white px-2 py-1 text-sm font-semibold text-darkGreen shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-secGreen disabled:cursor-not-allowed disabled:opacity-50'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth='1.5'
              stroke='currentColor'
              className='h-6 w-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M8.25 4.5l7.5 7.5-7.5 7.5'
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}