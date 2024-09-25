import React from 'react';
import { Step1Data, ErrorMessages } from '../validations';
import TitleDetails from './title-details';
import { Input, RadioGroup, Radio, DatePicker } from '@nextui-org/react';
import UploadImage from '@/app/components/core/upload-file';
import { parseDate } from "@internationalized/date";

interface Step1Props {
    formData: Step1Data;
    setFormData: (data: Partial<Step1Data>) => void;
    errors: ErrorMessages<Step1Data>;
}

const Step1: React.FC<Step1Props> = ({ formData, setFormData, errors }) => {
    // Format the date for initial value
    let d: any = new Date().toLocaleDateString("fr-FR").split("/");
    d = `${d[2]}-${d[1]}-${d[0]}`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleRadio = (value: string) => {
        setFormData({ ...formData, gender: value });
    };

    const handleChangeDate = (value: any) => {
        setFormData({ ...formData, date_of_birthday: `${value.year}-${value.month < 10 ? '0' : ''}${value.month}-${value.day < 10 ? '0' : ''}${value.day}` });
    };

    return (
        <div>
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
                <div className="space-y-2">
                    <UploadImage 
                        name='photo_url' 
                        data={null} 
                        fallback={""} 
                        description="Photo" 
                    />
                    {errors.photo_url && <div className='text-destructive text-red-600'>{errors.photo_url}</div>}
                </div>
            </div>
        </div>
    );
};

export default Step1;
