'use client'
import React, { useState, ChangeEvent } from 'react'
import { Avatar } from "@files-ui/react";

type Props = {
    fallback?: string;
    name: string;
    description: string;
    data: any;
    formData?: any;
    setFormData?: any;
}
const UploadImage: React.FC<Props> = ({ fallback, name, data, description, formData, setFormData }) => {
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFormData({ ...formData, [name]: file })
        console.log("Selected file is:", file); // Log the selected file
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    return (
        <div>
            <label htmlFor={name} className=''>{description} {data == null && <span className='text-sm text-red-500'>*</span>}</label>
            <div className='mt-2'>
                <input type='file' id={name} name={name} accept="image/*" onChange={handleImageChange} className={'mb-4 w-full text-gray-400 font-semibold text-sm bg-white border file:cursor-pointer cursor-pointer file:border-0 file:py-3 file:px-4 file:mr-4 file:bg-gray-100 file:hover:bg-gray-200 file:text-gray-500 rounded'} /></div>

            {(imagePreviewUrl || fallback !== "" && fallback !== undefined) &&
                <Avatar
                    readOnly
                    src={imagePreviewUrl || fallback}

                    emptyLabel={""}
                    alt="Image"
                    variant='square'

                />
            }

        </div>
    )
}

export default UploadImage
