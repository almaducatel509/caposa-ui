
"use client";
import EditBranch from "@/app/components/branches/editBranchesForm";
import { FaCalendarAlt } from "react-icons/fa";
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Chip,
  Tooltip, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody,
  Button,
  useDisclosure,
  Card,
  CardBody,
  Divider,
  Avatar,
  Badge
} from "@nextui-org/react";
import { FaRegTrashCan, FaRegEye, FaBuilding } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import { MdLocationOn, MdEmail } from "react-icons/md";
import { BsTelephone, BsBriefcase } from "react-icons/bs";
import { BranchData } from "@/app/components/branches/validations";
import { fetchBranches } from "@/app/lib/api/branche";

//Interface pour les branches
export interface Branch extends BranchData {
  id: string;
  branch_code: string;
}

interface BranchesTableProps {
  branches?: Branch[];
}

const BranchesTable: React.FC<BranchesTableProps> = ({ branches: initialBranches }) => {
  const [branches, setBranches] = useState<Branch[]>(initialBranches || []);
  const [isLoading, setIsLoading] = useState(!initialBranches);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fonction pour charger les données
  const loadBranchesData = async () => {
    if (initialBranches?.length && !isLoading) return; // Si des branches sont fournies en props, ne pas recharger
    
    try {
      setIsLoading(true);
      // Utiliser la fonction fetchBranches de votre API
      const data = await fetchBranches();
      console.log("Branch data:", data);
      setBranches(data);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBranchesData();
  }, [initialBranches]);

  // Fonction pour gérer le clic sur "Modifier"
  const handleEditBranch = (branchId: string) => {
    setSelectedBranchId(branchId);
    onOpen();
  };

  // Calcul de la catégorie de la branche basée sur le nombre total de personnel
  const getBranchCategory = (branch: Branch) => {
    const totalStaff = branch.number_of_tellers + 
                       branch.number_of_clerks + 
                       branch.number_of_credit_officers;
    
    if (totalStaff >= 20) return { color: "success", text: "Grande" };
    if (totalStaff >= 10) return { color: "primary", text: "Moyenne" };
    return { color: "warning", text: "Petite" };
  };

  // Format de la date en français
  const formatDate = (dateString: string) => {
    if (!dateString) return "Date inconnue";
    
    try {
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Colonnes du tableau - définies directement dans ce composant
  const columns = [
    { key: "info", label: "BRANCHE" },
    { key: "staff", label: "PERSONNEL" },
    { key: "contact", label: "CONTACT" },
    { key: "details", label: "DÉTAILS" },
    { key: "actions", label: "ACTIONS" },
  ];

  const renderCell = (branch: Branch, columnKey: React.Key) => {
    const branchCategory = getBranchCategory(branch);
    
    switch (columnKey) {
      case "info":
        return (
          <div className="flex items-start gap-3">
            <Avatar
              icon={<FaBuilding />}
              classNames={{
                base: "bg-gradient-to-br from-indigo-500 to-purple-500",
                icon: "text-white"
              }}
            />
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">{branch.branch_name}</p>
              <div className="flex items-center gap-1 text-xs text-default-500">
                <MdLocationOn />
                <span className="truncate max-w-xs">{branch.branch_address}</span>
              </div>
              <Chip className="mt-1" size="sm" variant="flat" color={branchCategory.color as any}>
                {branchCategory.text}
              </Chip>
            </div>
          </div>
        );

      case "staff":
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Badge content={branch.number_of_tellers} color="primary" size="sm">
                <Chip size="sm" variant="flat">Caissiers</Chip>
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge content={branch.number_of_clerks} color="secondary" size="sm">
                <Chip size="sm" variant="flat">Commis</Chip>
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge content={branch.number_of_credit_officers} color="success" size="sm">
                <Chip size="sm" variant="flat">Agents crédit</Chip>
              </Badge>
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs">
              <BsTelephone className="text-primary" />
              <span>{branch.branch_phone_number}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <MdEmail className="text-primary" />
              <span>{branch.branch_email}</span>
            </div>
          </div>
        );

      case "details":
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs">
              <BsBriefcase className="text-success" />
              <span>Code: <strong>{branch.branch_code}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <FaCalendarAlt className="text-warning" />
              <span>Ouvert le: <strong>{formatDate(branch.opening_date)}</strong></span>
            </div>
          </div>
        );

      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            <Tooltip content="Détails">
              <Button isIconOnly size="sm" variant="light" color="primary">
                <FaRegEye />
              </Button>
            </Tooltip>
            <Tooltip content="Modifier">
              <Button 
                isIconOnly 
                size="sm" 
                variant="light"
                color="default"
                onClick={() => handleEditBranch(branch.id)}
              >
                <FiEdit />
              </Button>
            </Tooltip>
            <Tooltip content="Supprimer">
              <Button isIconOnly size="sm" variant="light" color="danger">
                <FaRegTrashCan />
              </Button>
            </Tooltip>
          </div>
        );

      default:
        return null;
    }
  };

  // Composant rendu
  return (
    <Card className="shadow-md">
      <CardBody className="overflow-hidden px-0">
        <div className="flex justify-between items-center px-6 py-2">
          <h3 className="text-xl font-bold text-default-700">Gestion des Branches</h3>
          <Button color="primary" variant="shadow">
            + Nouvelle Branche
          </Button>
        </div>
        
        <Divider />
        
        <Table
          aria-label="Tableau des branches"
          removeWrapper
          selectionMode="none"
        >
          <TableHeader>
            {columns.map((column) => (
              <TableColumn 
                key={column.key} 
                align={column.key === "actions" ? "end" : "start"}
                className="bg-default-50 text-xs uppercase tracking-wider font-semibold"
              >
                {column.label}
              </TableColumn>
            ))}
          </TableHeader>
          <TableBody
            items={branches}
            isLoading={isLoading}
            loadingContent={
              <div className="p-6 text-center">
                Chargement des données des branches...
              </div>
            }
            emptyContent={
              <div className="p-6 text-center">
                Aucune branche trouvée
              </div>
            }
          >
            {(branch) => (
              <TableRow key={branch.id}>
                {(columnKey) => (
                  <TableCell>{renderCell(branch, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardBody>
      
      {/* Modal pour l'édition */}
      {/* Important: Le modal est rendu de façon conditionnelle côté client seulement */}
      {typeof window !== "undefined" && (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
          <ModalContent>
            {(onClose) => (
              <div>
                <ModalHeader className="flex items-center gap-2">
                  <FiEdit className="text-success" />
                  Modifier une Branche
                </ModalHeader>
                <ModalBody>
                  {selectedBranchId && (
                    <EditBranch 
                      branchId={selectedBranchId} 
                      onClose={onClose}
                      onSuccess={loadBranchesData}
                    />
                  )}
                </ModalBody>
              </div>
            )}
          </ModalContent>
        </Modal>
      )}
    </Card>
  );
};

export default BranchesTable;