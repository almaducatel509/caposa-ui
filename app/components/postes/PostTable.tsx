import { useState, useMemo, useCallback } from 'react';
import React from "react";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Tooltip,
  Input,
} from "@nextui-org/react";
import { LuPlus } from "react-icons/lu";
import { FiSearch } from "react-icons/fi";
import { TfiExport, TfiImport } from 'react-icons/tfi';
import { FaRegTrashCan } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";

// Import des modals
import CreatePostModal from './CreatePostModal';
import EditPostModal from './EditPostModal';
import DeletePostModal from './DeletePostModal';

export default function PostTable({ postes, onRefresh }: { 
  postes: any[], 
  onRefresh?: () => void 
}) {
  const [filterValue, setFilterValue] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;
  
  // États des modals
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Filtrer les postes par nom et description
  const filteredItems = useMemo(() => {
    return postes.filter(post => {
      if (post.name && typeof post.name === 'string') {
        const searchTerm = filterValue.toLowerCase();
        return post.name.toLowerCase().includes(searchTerm) ||
               (post.description && post.description.toLowerCase().includes(searchTerm));
      }
      return false;
    });
  }, [postes, filterValue]);
  
  const pages = Math.ceil(filteredItems.length / rowsPerPage);
  const itemsToDisplay = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredItems.slice(start, start + rowsPerPage);
  }, [page, filteredItems]);

  const onSearchChange = useCallback((value?: string) => {
    setFilterValue(value || '');
    setPage(1);
  }, []);

  const onClear = useCallback(() => {
    setFilterValue('');
    setPage(1);
  }, []);

  const getPermissionChips = (post: any) => {
    const permissions = [];
    if (post.deposit) permissions.push({ key: 'deposit', label: 'Dépôt', icon: '💰', color: 'success' as const });
    if (post.withdrawal) permissions.push({ key: 'withdrawal', label: 'Retrait', icon: '💸', color: 'warning' as const });
    if (post.transfer) permissions.push({ key: 'transfer', label: 'Transfert', icon: '🔄', color: 'primary' as const });
    return permissions;
  };

  // Gestionnaires des modals
  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const handleEdit = (post: any) => {
    setSelectedPost(post);
    setShowEditModal(true);
  };

  const handleDelete = (post: any) => {
    setSelectedPost(post);
    setShowDeleteModal(true);
  };

  const handleSuccess = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedPost(null);
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec recherche et actions */}
      <Card className="shadow-md border border-gray-100">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Recherche */}
            <div className="flex-1 max-w-md">
              <Input
                isClearable
                placeholder="Rechercher un poste..."
                startContent={<FiSearch className="text-gray-400" />}
                value={filterValue}
                onClear={onClear}
                onValueChange={onSearchChange}
                variant="bordered"
                classNames={{
                  input: "text-sm",
                  inputWrapper: "border-gray-200 hover:border-green-400 focus-within:border-green-500"
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                color="success"
                variant="solid"
                startContent={<LuPlus />}
                onPress={handleCreate}
                className="bg-green-600 text-white"
              >
                Nouveau Poste
              </Button>
              <Button 
                color="primary" 
                variant="bordered" 
                startContent={<TfiImport className="w-4 h-4" />}
                size="sm"
              >
                Importer
              </Button>
              <Button 
                color="primary" 
                variant="bordered" 
                startContent={<TfiExport className="w-4 h-4" />}
                size="sm"
              >
                Exporter
              </Button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {filteredItems.length} poste(s) trouvé(s)
              </span>
            </div>
            {filterValue && (
              <Chip size="sm" variant="flat" color="primary">
                Filtré par: "{filterValue}"
              </Chip>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Grille de postes */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {itemsToDisplay.map((post) => (
            <Card 
              key={post.id} 
              className="shadow-md hover:shadow-lg transition-shadow border border-gray-100"
            >
              <CardBody className="p-4">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800 mb-1">
                        {post.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {post.description}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Tooltip content="Modifier">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-green-600 hover:bg-green-50"
                          onPress={() => handleEdit(post)}
                        >
                          <FiEdit className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Supprimer">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => handleDelete(post)}
                        >
                          <FaRegTrashCan className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Permissions
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {getPermissionChips(post).length > 0 ? (
                        getPermissionChips(post).map((permission) => (
                          <Chip
                            key={permission.key}
                            color={permission.color}
                            variant="flat"
                            size="sm"
                            startContent={<span className="text-xs">{permission.icon}</span>}
                            classNames={{
                              content: "text-xs font-medium"
                            }}
                          >
                            {permission.label}
                          </Chip>
                        ))
                      ) : (
                        <Chip 
                          size="sm" 
                          variant="flat" 
                          color="default"
                          classNames={{
                            content: "text-xs"
                          }}
                        >
                          Aucune permission
                        </Chip>
                      )}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        /* État vide */
        <Card className="shadow-md border border-gray-100">
          <CardBody className="p-12 text-center">
            <div className="space-y-4">
              <div className="text-6xl">🏷️</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {filterValue ? "Aucun poste trouvé" : "Aucun poste disponible"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {filterValue 
                    ? "Essayez de modifier vos critères de recherche"
                    : "Commencez par créer votre premier poste"
                  }
                </p>
              </div>
              <div className="flex justify-center gap-2">
                {filterValue ? (
                  <Button 
                    onPress={onClear} 
                    variant="bordered"
                    className="text-green-600 border-green-300"
                  >
                    Effacer les filtres
                  </Button>
                ) : (
                  <Button
                    color="success"
                    startContent={<LuPlus />}
                    onPress={handleCreate}
                    className="bg-green-600 text-white"
                  >
                    Créer votre premier poste
                  </Button>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreatePostModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      {showEditModal && selectedPost && (
        <EditPostModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleSuccess}
          post={selectedPost}
        />
      )}

      {showDeleteModal && selectedPost && (
        <DeletePostModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={handleSuccess}
          post={selectedPost}
        />
      )}
    </div>
  );
}