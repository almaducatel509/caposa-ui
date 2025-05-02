
'use client';
import React from 'react';
import { memberSchema, MemberFormData, ErrorMessages } from './validations'; // ✅ Corrigé ici
import TitleDetails from './title-details';
import { Input, RadioGroup, Radio, DateInput, Autocomplete, AutocompleteItem, Select, SelectItem } from '@nextui-org/react';
import UploadImage from '../core/upload-file';
import { parseDate, DateValue } from "@internationalized/date";

interface MemberFormProps {
  formData: MemberFormData;
  setFormData: (data: Partial<MemberFormData>) => void;
  errors: ErrorMessages<MemberFormData>;
  setErrors?: (errors: ErrorMessages<MemberFormData>) => void;
}
const MemberForm: React.FC<MemberFormProps> = ({ formData, setFormData, errors }) => {
  const departments = [
    'Artibonite', 'Centre', 'Grand','Anse', 'Nippes', 'Nord',
    'Nord-Est', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Est'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? Number(value) : value;
    setFormData({ [name]: parsedValue });
  };

  const handleRadio = (value: string, field: keyof MemberFormData) => {
    setFormData({ [field]: value });
  }; 

  const handleChangeDate = (date: DateValue) => {
    setFormData({ date_of_birthday: date.toString() });
  };

  const handleChangeDepartment = (value: any) => {
    setFormData({ department: value });
  };

  return (
    <div className="space-y-10">
      <TitleDetails text1="Informations personnelles" text2="Fournir vos informations personnelles" />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <Input name="first_name" value={formData.first_name} label="Prénom" onChange={handleChange} isRequired />
        <Input name="last_name" value={formData.last_name} label="Nom" onChange={handleChange} isRequired />
        <RadioGroup label="Genre" value={formData.gender} onValueChange={(v) => handleRadio(v, 'gender')} orientation="horizontal">
          <Radio value="M">Masculin</Radio>
          <Radio value="F">Féminin</Radio>
        </RadioGroup>
        <DateInput label="Date de naissance" value={parseDate(formData.date_of_birthday || "1990-01-01")} onChange={handleChangeDate} />
        <Input name="id_number" value={formData.id_number} label="Numéro d'identité" onChange={handleChange} isRequired />
        <Input name="phone_number" value={formData.phone_number} label="Téléphone" onChange={handleChange} isRequired />
        <Input name="email" value={formData.email} label="Email" onChange={handleChange} type="email" />
        <Input name="address" value={formData.address} label="Adresse" onChange={handleChange} isRequired />
        <Autocomplete label="Département" selectedKey={formData.department} onSelectionChange={handleChangeDepartment}>
          {departments.map(dep => (
            <AutocompleteItem key={dep}>{dep}</AutocompleteItem>
          ))}
        </Autocomplete>
        <Input name="city" value={formData.city} label="Ville" onChange={handleChange} isRequired />
        <UploadImage name="photo_profil" data={null} fallback="" description="Photo" formData={formData} setFormData={setFormData} />
      </div>

      <TitleDetails text1="Informations de caisse" text2="Fournir vos informations de caisse" />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Input name="password" type="password" value={formData.password} label="Mot de passe" onChange={handleChange} isRequired />
        <Input name="confirm_password" type="password" value={formData.confirm_password} label="Confirmation mot de passe" onChange={handleChange} isRequired />
        <RadioGroup label="Type de compte" value={formData.account_type} onValueChange={(v) => handleRadio(v, 'account_type')} orientation="horizontal">
          <Radio value="courant">Courant</Radio>
          <Radio value="épargne">Épargne</Radio>
          <Radio value="rendement">Rendement en USD</Radio>
        </RadioGroup>
        <Input name="account_number" value={formData.account_number} label="Numéro de compte" onChange={handleChange} isRequired />
        <Input name="initial_balance" type="number" value={formData.initial_balance?.toString()} label="Solde initial" onChange={handleChange} isRequired />
        <RadioGroup label="Niveau de membership" value={formData.membership_tier} onValueChange={(v) => handleRadio(v, 'membership_tier')} orientation="horizontal">
          <Radio value="Basic">Basic</Radio>
          <Radio value="Premium">Premium</Radio>
          <Radio value="Gold">Gold</Radio>
        </RadioGroup>
        <Input name="monthly_income" type="number" value={formData.monthly_income?.toString()} label="Revenu mensuel" onChange={handleChange} />
        <Input name="monthly_expenses" type="number" value={formData.monthly_expenses?.toString()} label="Dépenses mensuelles" onChange={handleChange} />
        <Input name="income_source" value={formData.income_source} label="Source de revenu" onChange={handleChange} />
      </div>
    </div>
  );
};

export default MemberForm;
