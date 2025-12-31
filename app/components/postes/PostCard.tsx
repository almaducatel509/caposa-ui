"use client";

import React from "react";
import { Card, CardBody, Chip, Button, } from "@heroui/react";
import { FiEdit } from "react-icons/fi";
import { FaRegTrashCan } from "react-icons/fa6";

import { PostData } from "./validations";

interface Post extends PostData{
    id:string;
    name:string;
}
interface PostCardProps {
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
  
}

const PostCard: React.FC<PostCardProps> = ({
    post,
    onEdit,
    onDelete,
}) => {
  const getPermissionChips = () => {
    const permissions = [];
    if (post.deposit) permissions.push({ key: "deposit", label: "Dépôt", color: "success" as const, icon: "💰" });
    if (post.withdrawal) permissions.push({ key: "withdrawal", label: "Retrait", color: "warning" as const, icon: "💸" });
    if (post.transfert) permissions.push({ key: "transfer", label: "Transfert", color: "primary" as const, icon: "🔄" });
    return permissions;
  };

  return (
    <Card className="bg-white border border-gray-100 rounded-xl shadow-sm 
                 hover:shadow-md hover:border-gray-200 transition-all">
      <CardBody className="p-5">
        <div className="space-y-5">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-base text-gray-900">{post.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{post.description}</p>
            </div>

            <div className="flex gap-1 ml-3">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="text-gray-700 hover:bg-gray-100"
                onPress={() => onEdit(post)}
              >
                <FiEdit className="w-4 h-4" />
              </Button>

              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="text-red-500 hover:bg-red-50"
                onPress={() => onDelete(post)}
              >
                <FaRegTrashCan className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-2"> 
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide pb-1 border-b border-gray-200"> 
              Permissions 
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
                {getPermissionChips().length > 0 ? (
                getPermissionChips().map((permission) => (
                  <Chip
                    key={permission.key}
                    color={permission.color}
                    variant="flat"
                    size="sm"
                    radius="sm"
                    startContent={<span className="text-xs">{permission.icon}</span>}
                    classNames={{ content: "text-xs font-medium" }}
                  >
                    {permission.label}
                  </Chip>
                ))
              ) : (
                <Chip size="sm" variant="flat" color="default" radius="sm">
                  Aucune permission
                </Chip>
              )}
            </div>
          </div>

        </div>
      </CardBody>
    </Card>
  );
};

export default PostCard;
