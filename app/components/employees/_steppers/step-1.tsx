import React, { useState, useEffect,  } from 'react';
import {ErrorMessages,EmployeeFormData, step1Schema, Step1Data } from '../validations';
import TitleDetails from './title-details';
import { Input, RadioGroup, Radio, DatePicker, Select, SelectItem, } from '@nextui-org/react';
import UploadImage from '@/app/components/core/upload-file';
import { parseDate, getLocalTimeZone, DateValue } from "@internationalized/date";
import { Post } from '../../postes/validations';
import { PiEyeLight } from "react-icons/pi";
import { PiEyeSlashLight } from "react-icons/pi";
import { fetchBranches } from '@/app/lib/api/branche';
import type { Selection } from '@nextui-org/react';
import { fetchPosts } from '@/app/lib/api/post';
import { Branch } from '@/app/dashboard/branches/columns';

//j'aurais aimer genere un code de ref au lieu de rentrer manuellement. code unique.
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
    const [branches, setBranches] = useState<{ id: string; branch_name: string; }[]>([]);
    const [posts, setPosts] = useState<{ id: string; name: string }[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<Selection>(
        new Set(formData.branch || [])
    );
    const [selectedPost, setSelectedPost] = useState<Selection>(
        new Set(formData.branch || [])
    );
    const [loading, setLoading] = useState(true); // Indicateur de chargement
    const [error, setError] = useState<string | null>(null); // Holds error messages if any

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch branches and posts concurrently using Promise.all
                const [branchesResponse, postsResponse] = await Promise.all([
                    fetchBranches(),
                    fetchPosts(),
                ]);
    
                // Update state with fetched data
                setBranches(branchesResponse);
                setPosts(postsResponse);
    
                // Debugging logs
                console.log("Branches fetched:", branchesResponse);
                console.log("Posts fetched:", postsResponse);
            } catch (error) {
                console.error("Error fetching data:", error);
                    // Set error state to show user feedback
                setError("An error occurred while fetching data.");
            } finally {
                // Turn off loading state regardless of success or failure
                setLoading(false);
            }
        };
    
        // Trigger fetch function when component mounts
        fetchData();
    }, []); // Dependency array ensures this runs only once on mount
    
    // Conditional rendering for loading and error states
    if (loading) {
        return <p>Loading data...</p>; // Render a loading message
    }
    
    if (error) {
        return <p className="text-red-600">{error}</p>; // Render an error message
    }
    
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
    
    const handleBranchChange = (keys: Selection) => {
        const selected = Array.from(keys).pop() as string; // Get the single selected branch
        setSelectedBranch(keys);
        setFormData({ branch: selected });
    };
      
    const handlePostChange = (selectedKeys: Selection) => {
        const selectedValues = Array.from(selectedKeys) as string[];
        setSelectedPost(selectedKeys);
        setFormData({ posts: selectedValues });
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
                
                 {/* Branch Selection */}
                <div className="space-y-2">
                    <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
                    Branch
                    </label>
                    <Select
                        name="branch"
                        label="Select Branch"
                        placeholder="Choose a branch"
                        selectedKeys={selectedBranch}
                        selectionMode="single"
                        onSelectionChange={handleBranchChange}
                        className="w-full rounded px-3 py-2"
                    >
                    {branches.map((branch) => (
                        <SelectItem key={branch.id} textValue={branch.branch_name}>
                        {branch.branch_name}
                        </SelectItem>
                    ))}
                    </Select>
                </div>
                {/* Post Selection */}
                <div className="space-y-2">
                    <label htmlFor="posts" className="block text-sm font-medium text-gray-700">
                        Posts
                    </label>
                    <Select
                        name="posts"
                        label="Select Posts"
                        placeholder="Choose posts"
                        selectedKeys={selectedPost}
                        selectionMode="multiple"
                        onSelectionChange={handlePostChange}
                        className="w-full rounded px-3 py-2"
                    >
                        {posts.map((post) => (
                            <SelectItem 
                                key={post.id} 
                                textValue={post.name}
                            >
                                {post.name}
                            </SelectItem>
                        ))}
                    </Select>
                </div>

                <div className="space-y-2">
                    <UploadImage
                        name='photo_profil'
                        data={null}
                        fallback={""}
                        description="Photo"
                        formData={formData}
                        setFormData={setFormData}

                    />
                    {errors.photo_profil && <div className='text-destructive text-red-600'>{errors.photo_profil}</div>}
                </div>
            </div>
        </div>
    );
};

export default Step1;

