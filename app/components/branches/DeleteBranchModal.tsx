"use client";

import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody
} from "@nextui-org/react";
import { FaRegTrashCan, FaBuilding } from "react-icons/fa6";
import { MdLocationOn } from "react-icons/md";
import { deleteBranch } from '@/app/lib/api/branche';

interface Branch {
  id: string;
  branch_name: string;
  branch_address: string;
  branch_code: string;
  number_of_tellers: number;
  number_of_clerks: number;
  number_of_credit_officers: number;
}

interface DeleteBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  branch: Branch;
}

const DeleteBranchModal: React.FC<DeleteBranchModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  branch
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalEmployees = branch.number_of_tellers + branch.number_of_clerks + branch.number_of_credit_officers;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      
      await deleteBranch(branch.id);
      
      // Succès
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError('Erreur lors de la suppression de la branche. Veuillez réessayer.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      placement="center"
      backdrop="blur"
    >
      <ModalContent>
        <div>
          <ModalHeader className="flex items-center gap-2 text-danger bg-red-50 border-b border-red-200">
            <FaRegTrashCan className="text-xl" />
            <div>
              <h3 className="text-lg font-bold">Supprimer la branche</h3>
              <p className="text-sm font-normal text-red-600">Action irréversible</p>
            </div>
          </ModalHeader>
          
          <ModalBody className="p-6">
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <p className="text-[#2c2e2f]">
                Êtes-vous sûr de vouloir supprimer définitivement cette branche ?
              </p>

              {/* Card avec infos de la branche */}
              <Card className="border border-red-200 bg-red-50/30">
                <CardBody className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <FaBuilding className="text-red-600 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#2c2e2f] text-lg">
                        {branch.branch_name}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-[#2c2e2f]/70 mt-1">
                        <MdLocationOn className="w-4 h-4" />
                        {branch.branch_address}
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="text-[#2c2e2f]/70">Code: </span>
                        <span className="font-medium text-[#2c2e2f]">{branch.branch_code}</span>
                      </div>
                      <div className="mt-1 text-sm">
                        <span className="text-[#2c2e2f]/70">Personnel: </span>
                        <span className="font-medium text-[#2c2e2f]">{totalEmployees} employés</span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 text-xl">⚠️</span>
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 mb-1">
                      Attention : Cette action est irréversible
                    </p>
                    <ul className="text-amber-700 space-y-1">
                      <li>• Toutes les données de la branche seront perdues</li>
                      <li>• Les associations avec les employés seront supprimées</li>
                      <li>• L'historique des transactions sera affecté</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          
          <ModalFooter className="bg-gray-50">
            <Button 
              variant="light" 
              onPress={onClose}
              isDisabled={isDeleting}
              className="text-[#2c2e2f]"
            >
              Annuler
            </Button>
            <Button 
              color="danger" 
              onPress={handleDelete}
              isLoading={isDeleting}
              isDisabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Suppression..." : "Supprimer définitivement"}
            </Button>
          </ModalFooter>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default DeleteBranchModal;