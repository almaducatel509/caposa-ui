import React from 'react';
import { Input, DatePicker, Select, SelectItem } from '@nextui-org/react';
import TitleDetails from './title-details';
import { Step1Data } from '../validations'; // Importation du type pour Step1
import { Holiday } from '../../hollydays/validations'; // Importation du type Holiday
import { parseDate } from "@internationalized/date"; // Utilisé pour formater les dates

// Définition des props pour le composant Step1
interface Step1Props {
    formData: Step1Data; // Utilisation du type dérivé du schéma Zod pour Step1
    setFormData: (data: Partial<Step1Data>) => void; // Fonction pour mettre à jour les données du formulaire
    errors: Partial<Record<keyof Step1Data, string>>; // Gestion des erreurs basées sur les champs de Step1
    availableHolidays: Holiday[]; // Liste des jours fériés disponibles passée en props
}

const Step1: React.FC<Step1Props> = ({ formData, setFormData, errors, availableHolidays }) => {

    // Fonction pour gérer le changement de la date d'ouverture
    const handleChangeDate = (value: any) => {
        // Formatage de la date sélectionnée en une chaîne de caractères 'YYYY-MM-DD'
        setFormData({
            ...formData,
            opening_date: `${value.year}-${value.month < 10 ? '0' : ""}${value.month}-${value.day < 10 ? '0' : ''}${value.day}`
        });
    };

    // Formatage de la date actuelle au format 'fr-FR'
    let d: any = new Date().toLocaleDateString("fr-FR").split("/");
    d = `${d[2]}-${d[1]}-${d[0]}`;

    // Fonction pour gérer la sélection multiple de jours fériés
    const handleHolidayChange = (keys: any) => {
        const selectedKeys = Array.isArray(keys) ? keys : Array.from(keys as Set<React.Key>);
        // Trouver les jours fériés sélectionnés à partir des clés
        const selectedHolidays = selectedKeys.map((key) => {
            return availableHolidays.find((h) => h.date === key);
        }).filter(Boolean) as Holiday[]; // Filtrer les valeurs nulles et caster en Holiday[]

        // Mise à jour des données du formulaire avec les jours fériés sélectionnés
        setFormData({ ...formData, holidays: selectedHolidays });
    };

    // Fonction pour gérer les changements dans les champs Input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value, // Mise à jour de la valeur du champ correspondant
        });
    };

    return (
        <div>
            {/* Titre pour la section d'information de la branche */}
            <TitleDetails text1="Branch Information" text2="Provide the branch details" />
    
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* Champ pour le nom de la branche */}
                <div className="space-y-2">
                    <Input
                        type="text"
                        name="branch_name"
                        value={formData.branch_name || ''} 
                        label="Branch Name"
                        onChange={handleChange}
                        isRequired
                    />
                    {errors.branch_name && <div className="text-destructive text-red-600">{errors.branch_name}</div>}
                </div>
    
                {/* Champ pour l'adresse de la branche */}
                <div className="space-y-2">
                    <Input
                        type="text"
                        name="branch_address"
                        value={formData.branch_address || ''}
                        label="Branch Address"
                        onChange={handleChange}
                        isRequired
                    />
                    {errors.branch_address && <div className="text-destructive text-red-600">{errors.branch_address}</div>}
                </div>
    
                {/* Champ pour le numéro de téléphone de la branche */}
                <div className="space-y-2">
                    <Input
                        type="text"
                        name="branch_phone_number"
                        value={formData.branch_phone_number || ''}
                        label="Branch Phone Number"
                        onChange={handleChange}
                        isRequired
                    />
                    {errors.branch_phone_number && <div className="text-destructive text-red-600">{errors.branch_phone_number}</div>}
                </div>
    
                {/* Champ pour l'email de la branche */}
                <div className="space-y-2">
                    <Input
                        type="email"
                        name="branch_email"
                        value={formData.branch_email || ''}
                        label="Branch Email"
                        onChange={handleChange}
                        isRequired
                    />
                    {errors.branch_email && <div className="text-destructive text-red-600">{errors.branch_email}</div>}
                </div>
    
                {/* Champ pour le manager de la branche */}
                <div className="space-y-2">
                    <Input
                        type="text"
                        name="branch_manager_id"
                        value={formData.branch_manager_id || ''}
                        label="Branch Manager ID"
                        onChange={handleChange}
                        isRequired
                    />
                    {errors.branch_manager_id && <div className="text-destructive text-red-600">{errors.branch_manager_id}</div>}
                </div>
    
                {/* Champ pour le code de la branche */}
                <div className="space-y-2">
                    <Input
                        type="text"
                        name="branch_code"
                        value={formData.branch_code || ''}
                        label="Branch Code"
                        onChange={handleChange}
                        isRequired
                    />
                    {errors.branch_code && <div className="text-destructive text-red-600">{errors.branch_code}</div>}
                </div>
    
                {/* Sélecteur de date pour la date d'ouverture */}
                <div className="space-y-2">
                    <DatePicker
                        label="Opening Date"
                        className=""
                        isRequired
                        value={parseDate(formData.opening_date || d)}
                        onChange={handleChangeDate}
                    />
                    {errors.opening_date && <div className="text-destructive text-red-600">{errors.opening_date}</div>}
                </div>
                {/* Champ pour le nombre de postes */}
                <div className="space-y-2">
                    <Input
                        type="number"
                        name="number_of_posts"
                        value={formData.number_of_posts?.toString() || ''} // Convertir en chaîne
                        label="Number of Posts"
                        onChange={handleChange}
                        isRequired
                    />
                    {errors.number_of_posts && <div className="text-destructive text-red-600">{errors.number_of_posts}</div>}
                </div>

                {/* Champ pour le nombre de caissiers */}
                <div className="space-y-2">
                    <Input
                        type="number"
                        name="number_of_tellers"
                        value={formData.number_of_tellers?.toString() || ''}
                        label="Number of Tellers"
                        onChange={handleChange}
                        isRequired
                    />
                    {errors.number_of_tellers && <div className="text-destructive text-red-600">{errors.number_of_tellers}</div>}
                </div>

                {/* Champ pour le nombre de commis */}
                <div className="space-y-2 ">
                    <Input
                        type="number"
                        name="number_of_clerks"
                        value={formData.number_of_clerks?.toString() || ''}
                        label="Number of Clerks"
                        onChange={handleChange}
                        isRequired
                    />
                    {errors.number_of_clerks && <div className="text-destructive text-red-600">{errors.number_of_clerks}</div>}
                </div>

                {/* Champ pour le nombre d'agents de crédit */}
                <div className="space-y-2">
                    <Input
                        type="number"
                        name="number_of_credit_officers"
                        value={formData.number_of_credit_officers?.toString() || ''}
                        label="Number of Credit Officers"
                        onChange={handleChange}
                        isRequired
                    />
                    {errors.number_of_credit_officers && <div className="text-destructive text-red-600">{errors.number_of_credit_officers}</div>}
                </div>
                {/* Sélecteur pour les jours fériés */}
                <div className="space-y-2">
                    <Select
                        multiple
                        label="Select Holidays"
                        placeholder="Choose multiple holidays"
                        selectedKeys={new Set(formData.holidays?.map((holiday: { date: string; }) => holiday.date) || [])}
                        onSelectionChange={handleHolidayChange}
                    >
                        {availableHolidays && availableHolidays.length > 0 ? (
                            availableHolidays.map((holiday) => (
                                <SelectItem key={holiday.date} value={holiday.date}>
                                    {holiday.description} - {holiday.date}
                                </SelectItem>
                            ))
                        ) : (
                            <SelectItem isDisabled key={''}>Aucun jour férié disponible</SelectItem>
                        )}
                    </Select>
                    {errors.holidays && <div className="text-red-600">{errors.holidays}</div>}
                </div>
    
            </div>
        </div>
    );
    
};
export default Step1;
