import React, { useState } from 'react';
import {ErrorMessages,EmployeeFormData, step1Schema, Step1Data } from '../validations';
import TitleDetails from './title-details';
import { Input, RadioGroup, Radio, DatePicker } from '@nextui-org/react';
import UploadImage from '@/app/components/core/upload-file';
import { parseDate, getLocalTimeZone, DateValue } from "@internationalized/date";
import { Post } from '../../postes/validations';
import { PiEyeLight } from "react-icons/pi";
import { PiEyeSlashLight } from "react-icons/pi";

interface Step1Props {
    formData: Step1Data;
    setFormData: (data: Partial<Step1Data>) => void;
    errors: ErrorMessages<Step1Data>;
    setErrors?: (errors: Partial<ErrorMessages<Step1Data>>) => void; // Make setErrors optional
  }
    
  const Step1: React.FC<Step1Props> = ({ formData, setFormData, errors, setErrors }) => {
    
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);
    const toggleConfirmPasswordVisibility = () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
    
    let d: any = new Date().toLocaleDateString("fr-FR").split("/");
    d = `${d[2]}-${d[1]}-${d[0]}`;
    const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
      
        if (setErrors) {
          if (name === "confirm_password" && formData.password !== value) {
            setErrors({ ...errors, confirm_password: "Les mots de passe doivent être identiques" });
          } else if (name === "confirm_password") {
            setErrors({ ...errors, confirm_password: "" });
          }
        }
      };
      
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        console.log("Le formatdata :",formData);
    };

    const handleRadio = (value: string) => {
        setFormData({ ...formData, gender: value });
        console.log('gender: ',formData);
    };
    const handleChangeDate = (date: DateValue) => {
        const formattedDate = date.toString(); // Formate la date en YYYY-MM-DD
        setFormData({ date_of_birthday: formattedDate });
        console.log('Date de naissance mise à jour:', formattedDate); // Console pour vérifier la date sélectionnée
    };


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
                        type={'text'} 
                        name='username' 
                        value={formData.username} 
                        label={'Username'} 
                        onChange={handleChange} 
                        isRequired 
                    />
                    {errors.username && <div className='text-destructive text-red-600'>{errors.username}</div>}
                </div>
                
                
                <div className="space-y-2">
                    <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    label="Email"
                    onChange={handleChange}
                    isRequired
                    />
                    {errors.email && <div className="text-red-600">{errors.email}</div>}
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
                        description={"MM/DD/YYYY"}
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
                    <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    label="Password"
                    placeholder="Enter your password"
                    onChange={handlePassword}
                    isRequired
                    endContent={
                        <button
                        className="focus:outline-none"
                        type="button"
                        onClick={togglePasswordVisibility}
                        aria-label="toggle password visibility"
                        >
                        {isPasswordVisible ? (
                            <PiEyeSlashLight className="text-2xl text-default-400 pointer-events-none" />
                        ) : (
                            <PiEyeLight className="text-2xl text-default-400 pointer-events-none" />
                        )}
                        </button>
                    }
                    className="max-w-xs"
                    />
                    {errors.password && <div className="text-destructive text-red-600">{errors.password}</div>}
                </div>

                <div className="space-y-2">
                    <Input
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    name="confirm_password"
                    value={formData.confirm_password}
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    onChange={handlePassword}
                    isRequired
                    endContent={
                        <button
                        className="focus:outline-none"
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        aria-label="toggle confirm password visibility"
                        >
                        {isConfirmPasswordVisible ? (
                            <PiEyeSlashLight className="text-2xl text-default-400 pointer-events-none" />
                        ) : (
                            <PiEyeLight className="text-2xl text-default-400 pointer-events-none" />
                        )}
                        </button>
                    }
                    className="max-w-xs"
                    />
                    {errors.confirm_password && <div className="text-destructive text-red-600">{errors.confirm_password}</div>}
                </div>
                <div className="space-y-2">
                    <UploadImage
                        name='photo_url'
                        data={null}
                        fallback={""}
                        description="Photo"
                        formData={formData}
                        setFormData={setFormData}

                    />
                    {errors.photo_url && <div className='text-destructive text-red-600'>{errors.photo_url}</div>}
                </div>
            </div>
        </div>
    );
};

export default Step1;

