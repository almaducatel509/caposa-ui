import React, { useState, useEffect,  } from 'react';
import { Tooltip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import { FaRegTrashCan, FaRegEye } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
// import EditBranch from "./EditBranch"; // Adjust the path as needed
import { BranchData } from "@/app/components/branches/validations";


export type Branch = {
  branch_name: string;
  branch_address: string;
  branch_phone_number: string;
  branch_email: string;
  branch_code: string;
  opening_date: string;
  number_of_posts: number;
  number_of_tellers: number;
  number_of_clerks: number;
  number_of_credit_officers: number;
};

export const columns = [
  {
    key: "branch_name",
    label: "Branch Name",
  },
  {
    key: "branch_address",
    label: "Address",
  },
  {
    key: "branch_phone_number",
    label: "Phone Number",
  },
  {
    key: "branch_email",
    label: "Email",
  },
  {
    key: "branch_code",
    label: "Branch Code",
  },
  {
    key: "opening_date",
    label: "Opening Date",
  },
  {
    key: "actions",
    label: "Actions",
  },
];

export const renderCell = (branch: Branch, columnKey: React.Key) => {
  const cellValue = branch[columnKey as keyof Branch];
//Hydration failed because the server rendered HTML didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used
  const handleOpenModal = () => {
    console.log("open")  
  };

  const handleCloseModal = () => {
    console.log("open")  
  };
  switch (columnKey) {
    case "branch_name":
      return <strong>{branch.branch_name}</strong>;

    case "branch_address":
      return <p>{branch.branch_address}</p>;

    case "branch_phone_number":
      return <p>{branch.branch_phone_number}</p>;

    case "branch_email":
      return <p>{branch.branch_email}</p>;

    case "branch_code":
      return <span>{branch.branch_code}</span>;

    case "opening_date":
      return (
        <div>
          <strong>{new Date(branch.opening_date).toLocaleDateString()}</strong>
        </div>
      );

    case "actions":
      return (
        <div className="relative flex items-center gap-2">
          <Tooltip content="Details">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <FaRegEye />
            </span>
          </Tooltip>
          <Tooltip content="Edit Branch">
            <span
              className="text-lg text-default-400 cursor-pointer active:opacity-50"
              onClick={handleOpenModal}
            >
              <FiEdit />
            </span>
          </Tooltip>

          {/* Modal for Editing */}
          <Modal>
            <ModalContent>
              <ModalHeader>Modifier une Branche</ModalHeader>
              <ModalBody>
                {/* Render EditBranch inside the modal */}
                <Button
                  // branchId={branch.id} // Pass branchId to fetch and edit the branch
                  // onClose={handleCloseModal} // Close modal after save or cancel
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" onPress={handleCloseModal}>
                  Fermer
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          <Tooltip color="danger" content="Delete Branch">
            <span className="text-lg text-danger cursor-pointer active:opacity-50">
              <FaRegTrashCan />
            </span>
          </Tooltip>
        </div>
      );

    default:
      return cellValue;
  }
};
