// transactionColumns.ts
import React from "react";
import { Tooltip } from "@nextui-org/react";
import { FaRegTrashCan, FaRegEye } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";

// Définition du type Transaction
export type Transaction = {
  idTransaction: string;
  idCompte: string;
  idEmploye: string;
  noCompte: string;
  idCredit: string | null;
  typeTransaction: string;
  codeAutorisation: string;
  montantTransaction: number;
};

// Définir les colonnes de la table
export const TransactionColumns = [
  { key: "idTransaction", label: "ID Transaction" },
  { key: "noCompte", label: "No Compte" },
  { key: "idEmploye", label: "Caissiere" },
  { key: "montantTransaction", label: "Montant" },
  { key: "typeTransaction", label: "Type de Transaction" },
  { key: "actions", label: "Actions" },
];

// Fonction pour rendre le contenu des cellules
export const renderTransactionCell = (transaction: Transaction, columnKey: React.Key) => {
  switch (columnKey) {
    case "idTransaction":
      return <p>{transaction.idTransaction}</p>;
    case "typeTransaction":
      return <p>{transaction.typeTransaction}</p>;
    case "noCompte":
      return <p>{transaction.noCompte}</p>;
    case "idEmploye":
      return <p>{transaction.idEmploye}</p>
    case "montantTransaction":
      return <p>{transaction.montantTransaction} €</p>;

    case "actions":
      return (
        <div className="flex items-center gap-2">
          <Tooltip content="Details">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <FaRegEye />
            </span>
          </Tooltip>
          <Tooltip content="Edit Transaction">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <FiEdit />
            </span>
          </Tooltip>
          <Tooltip color="danger" content="Delete Transaction">
            <span className="text-lg text-danger cursor-pointer active:opacity-50">
              <FaRegTrashCan />
            </span>
          </Tooltip>
        </div>
      );

    default:
      return null;
  }
};
