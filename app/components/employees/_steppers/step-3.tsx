import { Step3Data } from "../validations";

interface Step3Props {
  formData: Step3Data; // Cela doit être un objet
}

const Step3: React.FC<Step3Props> = ({ formData }) => {
  return (
    <div className="font-normal	">
      <h2 className='text-base font-semibold leading-7 text-gray-900'>Complete</h2>
      <p className='mt-1 text-sm leading-6 text-gray-600'>Thank you for your submission.</p>
    </div>
  );
};
export default Step3;
