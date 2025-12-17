import React, { useState } from 'react';

// const CustomCheckbox =() => {
//     const [chekedRow, setChekedRow] = useState(false)
//     const handleRowSelect = (e:any) =>{
//         console.log(e.target.checked);
//         setChekedRow(e.target.checked);
//     }
//    return (
//     <input
//       type="checkbox"
//       checked={chekedRow}
//       onChange={handleRowSelect} // Calls the parent handler with the updated state
//     />
//   );
// };

// export default CustomCheckbox;

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ checked, onChange }) => {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
  );
};

export default CustomCheckbox;
