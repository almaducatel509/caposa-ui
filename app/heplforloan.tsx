// import React from 'react';
// import { Step2Data, ErrorMessages } from '../validations';
// import TitleDetails from './title-details';
// import { Autocomplete, AutocompleteItem, Input, Radio, RadioGroup } from '@nextui-org/react';
// import { format } from 'path';


// interface Step2Props {
//     formData: Step2Data;
//     setFormData: (data: Partial<Step2Data>) => void;
//     errors: ErrorMessages<Step2Data>;
// }

// type Frequency = {
//     value: string;
//     label: string;
// }

// type Properties = {
//     value: string;
//     label: string;
// }
// const Step2: React.FC<Step2Props> = ({ formData, setFormData, errors }) => {
//     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//         const { name, value } = e.target;
//         setFormData({ ...formData, [name]: value });
//         console.log('Form Data:', formData);
//     };
// const handleChangeFrequecy = (value:any)=>{
//         console.log(value)
//         setFormData({ ...formData, payment_frequency: value })
//         console.log('Form Data:', formData);

// }
// const handleChangegDuration = (value:any)=>{
//     console.log(value)
//     setFormData({ ...formData, loan_duration: value })
//     console.log('Form Data:', formData);

// }
    
//     const frequency: Frequency[] = [
//         { label: 'Weekly', value: 'Weekly' },
//         { label: 'Bi-weekly', value: 'Bi-weekly' },
//         { label: 'Monthly', value: 'Monthly' },
//         { label: 'Quarterly', value: 'Quarterly' },
//         { label: 'Semi-annual', value: 'Semi-annual' },
//         { label: 'Annual', value: 'Annual' },
//     ];

//     const loan_duration: Properties[] = [
//         { label: '6 Months', value: '6 Months' },
//         { label: '12-months', value: '12-months' },
//         { label: '24-months', value: '24-months' },
//         { label: '36-months', value: '36-months' },
//         { label: '48-months', value: '48-months' },
//         { label: '60-months', value: '60-months' },
//         { label: '72-months', value: '72-months' },
//         { label: '80-months', value: '80-months' },
//         { label: '96-months', value: '96-months' },
//         { label: '108-months', value: '108-months' },
//         { label: '120-months', value: '120-months' },
//     ];
//     const handleRadio = (value: string) => {
//         setFormData({ account_type: value });
//         console.log("Genre sélectionné :", value); // Console pour vérifier le sexe sélectionné
//     };
    

//     return (
//         <div>
//             <TitleDetails text1="Informations de caisse" text2="Fournir vos informations de caisse" />
//             <div className="space-y-2">
//                 <Input
//                     label="Account Number"
//                     name="account_number"
//                     type="text"
//                     value={formData.account_number} 
//                     onChange={handleChange}
//                     isRequired
//                 />
//                 {errors.account_number && <p className="text-red-600">{errors.account_number}</p>}
//             </div>

//             <div className="space-y-2">
//                 <Input
//                     label="Current Balance"
//                     name="current_balance"
//                     type="number"
//                     value={formData.current_balance?.toString() || ''}
//                     onChange={handleChange}
//                     isRequired
//                     endContent={
//                         <div className="pointer-events-none flex items-center">
//                             <span className="text-default-400 text-small">G</span> 
//                         </div>
//                     }
//                 />
//                 {errors.current_balance && <p className="text-red-600">{errors.current_balance}</p>}
//             </div>
//             <div className="space-y-2"> 
//                 <label htmlFor="loan_type">Type de prêt :</label> 
//                 <select
//                  id="loan_type" 
//                  name="loan_type" 
//                  value={formData.loan_type} 
//                  onChange={handleChange} 
//                  required > 
//                     <option value="">Sélectionner un type de prêt</option> 
//                     <option value="personal">Prêt personnel</option> 
//                     <option value="mortgage">Prêt hypothécaire</option> 
//                     <option value="auto">Prêt automobile</option> 
//                     <option value="student">Prêt étudiant</option> 
//                     <option value="business">Prêt commercial</option> 
//                  </select> 
//             </div>
            
//             <div className="space-y-2">
//                 <Input
//                     label="Loan Amount"
//                     name="loan_amount"
//                     type="number"
//                     value={formData.loan_amount?.toString() || ''}
//                     onChange={handleChange}
//                     isRequired
//                     endContent={
//                         <div className="pointer-events-none flex items-center">
//                             <span className="text-default-400 text-small">G</span> 
//                         </div>
//                     }
//                 />
//                 {errors.loan_amount && <p className="text-red-600">{errors.loan_amount}</p>}
//             </div>

//             <div className="space-y-2">
//                 <Input
//                     label="Interest Rate (%)"
//                     name="interest_rate"
//                     type="number"
//                     value={formData.interest_rate?.toString() || ''}
//                     onChange={handleChange}
//                     isRequired
//                 />
//                 {errors.interest_rate && <p className="text-red-600">{errors.interest_rate}</p>}
//             </div>

//             <div className="space-y-2">
//                 <Input
//                     label="Monthly Income"
//                     name="monthly_income"
//                     type="number"
//                     value={formData.monthly_income?.toString() || ''}
//                     onChange={handleChange}
//                     isRequired
//                     endContent={
//                         <div className="pointer-events-none flex items-center">
//                             <span className="text-default-400 text-small">G</span> 
//                         </div>
//                     }
//                 />
//                 {errors.monthly_income && <p className="text-red-600">{errors.monthly_income}</p>}
//             </div>

//             <div className="space-y-2">
//                 <Input
//                     label="Monthly Expenses"
//                     name="monthly_expenses"
//                     type="number"
//                     value={formData.monthly_expenses?.toString() || ''}
//                     onChange={handleChange}
//                     isRequired
//                     endContent={
//                         <div className="pointer-events-none flex items-center">
//                             <span className="text-default-400 text-small">G</span> 
//                         </div>
//                     }
//                 />
//                 {errors.monthly_expenses && <p className="text-red-600">{errors.monthly_expenses}</p>}
//             </div>

//             <div className="space-y-2">
//                 <Autocomplete
//                     label="Frequency"
//                     defaultItems={frequency}
//                     placeholder="Choisir un fréquence de paiement"
//                     className=""
//                     selectedKey={formData.payment_frequency}
//                     isRequired
//                     onSelectionChange={handleChangeFrequecy}
//                 >
//                     {(item) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
//                 </Autocomplete>
//                 {errors.payment_frequency && <div className='text-destructive text-red-600'>{errors.payment_frequency}</div>}
//             </div>

//             <div className="space-y-2">
//                 <Input
//                     label="Security Question"
//                     name="security_question"
//                     type="text"
//                     value={formData.security_question || ''}
//                     onChange={handleChange}
//                     isRequired
//                 />
//                 {errors.security_question && <p className="text-red-600">{errors.security_question}</p>}
//             </div>

//             <div className="space-y-2">
//                 <Input
//                     label="Security Answer"
//                     name="security_answer"
//                     type="text"
//                     value={formData.security_answer || ''}
//                     onChange={handleChange}
//                     isRequired
//                 />
//                 {errors.security_answer && <p className="text-red-600">{errors.security_answer}</p>}
//             </div>
            
//             <div className="space-y-2">
//                 <div className="flex flex-col gap-3">
//                 <RadioGroup
//                     label="Sélectionner le type de compte"
//                     value={formData.account_type}
//                     onValueChange={handleRadio}
//                     className="space-y-2"
//                     isRequired
//                 >
//                     <Radio value="checking-account" className="flex items-center">Compte courant</Radio>
//                     <Radio value="savings-account" className="flex items-center">Compte d'épargne</Radio>
//                     <Radio value="personal-loan-account" className="flex items-center">Compte de prêt personnel</Radio>
//                     <Radio value="business-account" className="flex items-center">Compte d'entreprise</Radio>
//                 </RadioGroup>

//                 </div>
//                 {errors.loan_type && <p className="text-red-600">{errors.loan_type}</p>}
//             </div>
            
//             <div className="space-y-2">
//                 <Autocomplete
//                     label="Sélectionner la duree du pret"
//                     defaultItems={loan_duration}
//                     placeholder="Choisir un fréquence de paiement"
//                     className=""
//                     selectedKey={formData.loan_duration}
//                     isRequired
//                     onSelectionChange={handleChangegDuration}
//                 >
//                     {(item) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
//                 </Autocomplete>
//                 {errors.loan_duration && <div className='text-destructive text-red-600'>{errors.loan_duration}</div>}
//             </div>
//         </div>
//     );
// };

// export default Step2;
