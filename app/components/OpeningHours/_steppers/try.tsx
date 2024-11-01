import React from 'react';
import { TimeInput } from "@nextui-org/react";
import type { TimeValue } from "@react-types/datepicker";
import { ZonedDateTime } from "@internationalized/date";
import { OpeningHours, ErrorMessages } from '../validations';
import { parseZonedDateTime } from "@internationalized/date";

interface Step1Props {
  formData: OpeningHours;
  setFormData: (data: Partial<OpeningHours>) => void;
  errors: ErrorMessages<OpeningHours>;
}

const Step1: React.FC<Step1Props> = ({ formData, setFormData, errors }) => {
  const initializeTimeValue = (timeString: string | undefined) => {
    if (timeString) {
      return parseZonedDateTime(`2024-04-08T${timeString.split('-')[0]}:00[UTC]`);
    } else {
      return parseZonedDateTime("2024-04-08T08:00:00[UTC]");
    }
  };

  const handleTimeChange = (day: keyof OpeningHours, value: TimeValue, isOpen: boolean) => {
    if (value instanceof ZonedDateTime) {
      const formattedTime = `${value.hour.toString().padStart(2, '0')}:${value.minute.toString().padStart(2, '0')}`;
      const key = day as keyof OpeningHours;

      const currentTimes = formData[key] || "08:00-17:00"; // valeur par défaut
      const [currentOpen] = currentTimes.split('-');
      const newTime = isOpen ? `${formattedTime}-${currentTimes.split('-')[1]}` : `${currentOpen}-${formattedTime}`;

      console.log(`Modification de ${key} : Nouvelle valeur = ${newTime}`);
      setFormData({ [key]: newTime });
    }
  };

  return (
    <div>
      {(["monday", "tuesday", "wednesday", "thursday", "friday"] as Array<keyof OpeningHours>).map((day) => (
  <div key={day} className="mb-4">
    <label className="block font-semibold mb-2">{day.charAt(0).toUpperCase() + day.slice(1)}: </label>

    <TimeInput
      label="Open Time"
      hideTimeZone
      value={initializeTimeValue(formData[day])}
      onChange={(value) => handleTimeChange(day, value, true)}
    />
    {errors[day] && <span className="text-red-500">{errors[day]}</span>}

    <TimeInput
      label="Close Time"
      hideTimeZone
      value={initializeTimeValue(formData[day])}
      onChange={(value) => handleTimeChange(day, value, false)}
    />
    {errors[day] && <span className="text-red-500">{errors[day]}</span>}
  </div>
))}

    </div>
  );
};

// export default Step1;

// import React from 'react';
// import { TimeInput } from "@nextui-org/react";
// import type { TimeValue } from "@react-types/datepicker";
// import { ZonedDateTime } from "@internationalized/date";
// import { OpeningHours, ErrorMessages } from '../validations';
// import { parseZonedDateTime } from "@internationalized/date";

// interface Step1Props {
//   formData: OpeningHours;
//   setFormData: (data: Partial<OpeningHours>) => void;
//   errors: ErrorMessages<OpeningHours>;
// }

// const Step1: React.FC<Step1Props> = ({ formData, setFormData, errors }) => {
//   const initializeTimeValue = (timeString: string | undefined) => {
//     if (timeString) {
//       // Assume timeString is in "HH:mm" format and construct a ZonedDateTime
//       return parseZonedDateTime(`2024-04-08T${timeString.split('-')[0]}:00[UTC]`);
//     } else {
//       // Default value if no timeString is provided
//       return parseZonedDateTime("2024-04-08T08:00:00[UTC]");
//     }
//   };

//   const handleTimeChange = (day: keyof OpeningHours, timeType: "open" | "close", value: TimeValue) => {
//     if (value instanceof ZonedDateTime) {
//       const formattedTime = `${value.hour.toString().padStart(2, '0')}:${value.minute.toString().padStart(2, '0')}`;
//       const key = `${day}_${timeType}` as keyof OpeningHours;

//       console.log(`Modification de ${key} : Nouvelle valeur = ${formattedTime}`);

//       setFormData({ [key]: formattedTime });
//     }
//   };

//   return (
//     <div>
//       {["monday", "tuesday", "wednesday", "thursday", "friday"].map((day) => {
//         const openKey = `${day}_open` as keyof OpeningHours;
//         const closeKey = `${day}_close` as keyof OpeningHours;

//         return (
//           <div key={day} className="mb-4">
//             <label className="block font-semibold mb-2">{day.charAt(0).toUpperCase() + day.slice(1)}: </label>
            
//             <TimeInput
//               label="Open Time"
//               hideTimeZone
//               value={initializeTimeValue(formData[openKey])}
//               onChange={(value) => handleTimeChange(day as keyof OpeningHours, "open", value)}
//             />
//             {errors[openKey] && (
//               <span className="text-red-500">{errors[openKey]}</span>
//             )}

//             <TimeInput
//               label="Close Time"
//               hideTimeZone
//               value={initializeTimeValue(formData[closeKey])}
//               onChange={(value) => handleTimeChange(day as keyof OpeningHours, "close", value)}
//             />
//             {errors[closeKey] && (
//               <span className="text-red-500">{errors[closeKey]}</span>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default Step1;
