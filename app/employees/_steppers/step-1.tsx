import React,  { useState } from 'react';
import { Step1Data, ErrorMessages } from '../validations';
import TitleDetails from './title-details';
import { Input, RadioGroup, Radio, DatePicker } from '@nextui-org/react';
import UploadImage from '@/app/components/core/upload-file';
import { parseDate } from "@internationalized/date";
import { Post } from '../../postes/validations';

// Define props to receive formData, setFormData, and errors
interface Step1Props {
    formData: {
      user: {
        username: string;
        password: string;
        confirm_password: string;
        email: string;
      };
      first_name: string;
      last_name: string;
      gender: string;
      date_of_birthday: string;
      phone_number: string;
      address: string;
      payment_ref?: string;
      city: string;
      department: string;
      photo_url: File;
      posts: Post[];
    };
    setFormData: (data: any) => void;
    errors: ErrorMessages<{
      user: {
        username: string;
        password: string;
        confirm_password: string;
        email: string;
      };
      first_name: string;
      last_name: string;
      gender: string;
      date_of_birthday: string;
      phone_number: string;
      address: string;
      payment_ref?: string;
      city: string;
      department: string;
      photo_url: File;
      posts: Post[];
    }>;
  }
  
const Step1: React.FC<Step1Props> = ({ formData, setFormData, errors }) => {

    let d: any = new Date().toLocaleDateString("fr-FR").split("/");
    d = `${d[2]}-${d[1]}-${d[0]}`;

    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
          ...formData,
          user: {
            ...formData.user,
            [name]: value,
          },
        });
      };

      const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ [name]: value });
    };


    const handleRadio = (value: string) => {
        setFormData({ ...formData, gender: value });
    };

    const handleChangeDate = (value: any) => {
        setFormData({ ...formData, date_of_birthday: `${value.year}-${value.month < 10 ? '0' : ''}${value.month}-${value.day < 10 ? '0' : ''}${value.day}` });
    };

    function handlePostSelection(name: any, checked: boolean): void {
        throw new Error('Function not implemented.');
    }

    return (
        <div className="capitalize">
            <TitleDetails text1={'Remplir les champs nécessaires'} text2={'Fournir vos informations personnelles'} />
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
               
                <div className="space-y-2">
                    <Input 
                        type={'text'} 
                        name='first_name' 
                        value={formData.first_name} 
                        label={'Prénom'} 
                        onChange={handleChange} 
                        isRequired 
                    />
                    {errors.first_name && <div className='text-destructive text-red-600'>{errors.first_name}</div>}
                </div>
                <div className="space-y-2">
                    <Input 
                        type={'text'} 
                        name='last_name' 
                        value={formData.last_name} 
                        label={'Nom'} 
                        onChange={handleChange} 
                        isRequired 
                    />
                    {errors.last_name && <div className='text-destructive text-red-600'>{errors.last_name}</div>}
                </div>
                <div className="space-y-2">
                    <Input
                    type="text"
                    name="name"
                    value={formData.user.username}
                    label="User Name"
                    onChange={handleUserChange}
                    isRequired
                    />
                    {errors.user?.username && <div className="text-red-600">{errors.user.username}</div>}
                </div>
                
                <div className="space-y-2">
                    <Input
                    type="email"
                    name="email"
                    value={formData.user.email}
                    label="Email"
                    onChange={handleUserChange}
                    isRequired
                    />
                    {errors.user?.email && <div className="text-red-600">{errors.user.email}</div>}
                </div>
                <div className="space-y-2">
                    <RadioGroup
                        label="Choisir le sexe"
                        isRequired
                        orientation="horizontal"
                        name='gender'
                        value={formData.gender}
                        onValueChange={handleRadio}
                    >
                        <Radio value="M">M</Radio>
                        <Radio value="F">F</Radio>
                    </RadioGroup>
                    {errors.gender && <div className='text-destructive text-red-600'>{errors.gender}</div>}
                </div>
                <div className="space-y-2">
                    <DatePicker
                        label="Date de naissance"
                        isRequired
                        value={parseDate(formData.date_of_birthday || d)}
                        onChange={handleChangeDate}
                    />
                    {errors.date_of_birthday && <div className='text-destructive text-red-600'>{errors.date_of_birthday}</div>}
                </div>

                <div className="space-y-2">
                    <Input 
                        type={'text'} 
                        name='phone_number' 
                        value={formData.phone_number} 
                        label={'Téléphone'} 
                        onChange={handleChange} 
                        isRequired 
                    />
                    {errors.phone_number && <div className='text-destructive text-red-600'>{errors.phone_number}</div>}
                </div>
                <div className="space-y-2">
                    <Input 
                        type={'text'} 
                        name='address' 
                        value={formData.address} 
                        label={'Adresse'} 
                        onChange={handleChange} 
                        isRequired 
                    />
                    {errors.address && <div className='text-destructive text-red-600'>{errors.address}</div>}
                </div>
                {/* <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Select Posts</label>
                    <div className="grid grid-cols-1 gap-2">
                    {availablePosts.map((post) => (
                        <div key={post.name} className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id={`post-${post.name}`}
                            checked={formData.posts.includes(post.name)}
                            onChange={(e) => handlePostSelection(post.name, e.target.checked)}
                        />
                        <label htmlFor={`post-${post.name}`} className="text-sm text-gray-700">
                            {post.name}
                        </label>
                        </div>
                    ))}
                    </div>
                    {errors.posts && <div className="text-red-600">{errors.posts}</div>}
                </div> */}
                <div className="space-y-2">
                    <UploadImage 
                        name='photo_url' 
                        data={null} 
                        fallback={""} 
                        description="Photo" 
                    />
                    {errors.photo_url && <div className='text-destructive text-red-600'></div>}
                </div>
            </div>
        </div>
    );
};

export default Step1;