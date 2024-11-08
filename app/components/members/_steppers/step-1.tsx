import React from 'react';
import { Step1Data, ErrorMessages } from '../validations';
import TitleDetails from './title-details';
import { Input, RadioGroup, Radio, DateInput, Autocomplete, AutocompleteItem } from '@nextui-org/react'
import UploadImage from '../../core/upload-file';
import { parseDate, getLocalTimeZone, DateValue } from "@internationalized/date";

interface Step1Props {
    formData: Step1Data;
    setFormData: (data: Partial<Step1Data>) => void;
    errors: ErrorMessages<Step1Data>;
}
type Option = {
    value: string;
    label: string;
}

const Step1: React.FC<Step1Props> = ({ formData, setFormData, errors }) => {
    const color = 'success';
    const options: Option[] = [
        { label: 'Artibonite', value: 'Artibonite' },
        { label: 'Centre', value: 'Centre' },
        { label: 'Grand\'Anse', value: 'Grand\'Anse' },
        { label: 'Nippes', value: 'Nippes' },
        { label: 'Nord', value: 'Nord' },
        { label: 'Nord-Est', value: 'Nord-Est' },
        { label: 'Nord-Ouest', value: 'Nord-Ouest' },
        { label: 'Ouest', value: 'Ouest' },
        { label: 'Sud', value: 'Sud' },
        { label: 'Sud-Est', value: 'Sud-Est' },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleRadio = (value: string) => {
        setFormData({ gender: value });
        console.log("Genre sélectionné :", value); // Console pour vérifier le sexe sélectionné
    };
    
    const handleChangeDate = (date: DateValue) => {
        const formattedDate = date.toString(); // Formate la date en YYYY-MM-DD
        setFormData({ date_of_birthday: formattedDate });
        console.log('Date de naissance mise à jour:', formattedDate); // Console pour vérifier la date sélectionnée
    };

    const handleChangeDepartment = (value:any)=>{
            console.log(value)
            setFormData({ ...formData, department: value })
    }

    return (
        <div>
            <TitleDetails text1="Informations personnelles" text2="Fournir vos informations personnelles" />
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="space-y-2">
                    <Input type="text" name="first_name" value={formData.first_name} label="Prénom" onChange={handleChange} isRequired />
                    {errors.first_name && <div className='text-destructive text-red-600'>{errors.first_name}</div>}
                </div>
                <div className="space-y-2">
                    <Input type="text" name="last_name" value={formData.last_name} label="Nom" onChange={handleChange} isRequired />
                    {errors.last_name && <div className='text-destructive text-red-600'>{errors.last_name}</div>}
                </div>
                <div className="space-y-2">                  
                    <RadioGroup
                        label="Choisir le sexe"
                        isRequired
                        orientation="horizontal"
                        name="gender"
                        value={formData.gender}
                        onValueChange={handleRadio}
                        color="primary"
                        defaultValue="F"
                  
                    >
                        <Radio value="M">M</Radio>
                        <Radio value="F">F</Radio>
                    </RadioGroup>
                    {errors.gender && <div className='text-destructive text-red-600'>{errors.gender}</div>}
                </div>
                <div className="space-y-2">
                    <DateInput
                        label="Date de naissance"
                        description="Veuillez entrer la date au format AAAA-MM-JJ"
                        isInvalid={false} // Par défaut, non invalide
                        value={parseDate(formData.date_of_birthday || "1997-06-09")}
                        onChange={handleChangeDate}
                        isRequired
                        errorMessage={errors.date_of_birthday}
                        className="max-w-xs text-black"
                    />
                </div>
                <div className="space-y-2">
                    <Input type="text" name="id_number" value={formData.id_number} label="Numero identité" onChange={handleChange} isRequired />
                    {errors.id_number && <div className='text-destructive text-red-600'>{errors.id_number}</div>}
                </div>
                <div className="space-y-2">
                    <Input type="text" name="phone_number" value={formData.phone_number} label="Téléphone" onChange={handleChange} isRequired />
                    {errors.phone_number && <div className='text-destructive text-red-600'>{errors.phone_number}</div>}
                </div>
                <div className="space-y-2">
                    <Input type="email" name="email" value={formData.email} label="Email" onChange={handleChange} />
                    {errors.email && <div className='text-red-600'>{errors.email}</div>}
                </div>
                <div className="space-y-2">
                    <Input type="text" name="address" value={formData.address} label="Adresse" onChange={handleChange} isRequired />
                    {errors.address && <div className='text-red-600'>{errors.address}</div>}
                </div>
                <div className="space-y-2">
                    <Autocomplete
                        label="Département"
                        defaultItems={options}
                        placeholder="Choisir un département"
                        className=""
                        selectedKey={formData.department}
                        isRequired
                        onSelectionChange={handleChangeDepartment}
                    >
                        {(item) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
                    </Autocomplete>
                    {errors.department && <div className='text-destructive text-red-600'>{errors.department}</div>}
                </div>
                <div className="space-y-2 md:mt-6">
                    <Input 
                        type="text" 
                        name="city" 
                        value={formData.city} 
                        label="Ville" 
                        onChange={handleChange} 
                        isRequired  
                    />
                    {errors.city && <div className='text-destructive text-red-600'>{errors.city}</div>}
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
