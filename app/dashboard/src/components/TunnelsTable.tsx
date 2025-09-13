import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  HStack,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Badge,
  Box,
  Tooltip,
  VStack,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useRef,
  Spinner,
  Center,
  chakra
} from "@chakra-ui/react";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  EllipsisVerticalIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  PencilIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { Tunnel, Node } from "types/Tunnel";
import { TunnelStatusBadge } from "./TunnelStatusBadge";
import { TunnelTypeBadge } from "./TunnelTypeBadge";
import { LinkIcon, ActivityIcon } from "./TunnelIcons";

const iconProps = {
  baseStyle: {
    w: 4,
    h: 4,
  },
};

const MoreVerticalIcon = chakra(EllipsisVerticalIcon, iconProps);
const PlayIconComponent = chakra(PlayIcon, iconProps);
const PauseIconComponent = chakra(PauseIcon, iconProps);
const TrashIconComponent = chakra(TrashIcon, iconProps);
const EditIconComponent = chakra(PencilIcon, iconProps);
const RefreshIconComponent = chakra(ArrowPathIcon, iconProps);

interface TunnelsTableProps {
  tunnels: Tunnel[];
  nodes: Node[];
  isLoading?: boolean;
  onEdit: (tunnel: Tunnel) => void;
  onDelete: (tunnelId: number) => Promise<void>;
  onToggle: (tunnelId: number, isActive: boolean) => Promise<void>;
  onRefresh: () => void;
}

export const TunnelsTable: FC<TunnelsTableProps> = ({
  tunnels,
  nodes,
  isLoading = false,
  onEdit,
  onDelete,
  onToggle,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [tunnelToDelete, setTunnelToDelete] = useState<Tunnel | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleDelete = async (tunnel: Tunnel) => {
    setTunnelToDelete(tunnel);
    onOpen();
  };

  const confirmDelete = async () => {
    if (tunnelToDelete) {
      setDeletingId(tunnelToDelete.id);
      try {
        await onDelete(tunnelToDelete.id);
        toast({
          title: t('tunnel.deleted'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: t('tunnel.error.deleteFailed'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setDeletingId(null);
        onClose();
        setTunnelToDelete(null);
      }
    }
  };

  const handleToggle = async (tunnel: Tunnel) => {
    setTogglingId(tunnel.id);
    try {
      await onToggle(tunnel.id, !tunnel.is_active);
      toast({
        title: tunnel.is_active ? t('tunnel.deactivated') : t('tunnel.activated'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: t('tunnel.error.toggleFailed'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setTogglingId(null);
    }
  };

  const getNodeName = (nodeId: number) => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? node.name : `Node ${nodeId}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Center py={8}>
        <VStack spacing={4}>
          <Spinner size="lg" color="blue.500" />
          <Text color="gray.500">{t('tunnel.loading')}</Text>
        </VStack>
      </Center>
    );
  }

  if (tunnels.length === 0) {
    return (
      <Center py={8}>
        <VStack spacing={4}>
          <LinkIcon size={48} />
          <Text fontSize="lg" color="gray.500">
            {t('tunnel.noTunnels')}
          </Text>
          <Text fontSize="sm" color="gray.400">
            {t('tunnel.createFirst')}
          </Text>
        </VStack>
      </Center>
    );
  }

  return (
    <>
      <TableContainer>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>
                <HStack>
                  <Text>{t('tunnel.name')}</Text>
                  <IconButton
                    aria-label={t('common.refresh')}
                    icon={<RefreshIconComponent />}
                    size="xs"
                    variant="ghost"
                    onClick={onRefresh}
                    isLoading={isLoading}
                  />
                </HStack>
              </Th>
              <Th>{t('tunnel.type')}</Th>
              <Th>{t('tunnel.connection')}</Th>
              <Th>{t('tunnel.status')}</Th>
              <Th>{t('tunnel.created')}</Th>
              <Th width="120px">{t('common.actions')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {tunnels.map((tunnel) => (
              <Tr key={tunnel.id}>
                <Td>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium">
                      {tunnel.name || `Tunnel ${tunnel.id}`}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      ID: {tunnel.id}
                    </Text>
                  </VStack>
                </Td>
                
                <Td>
                  <TunnelTypeBadge tunnelType={tunnel.tunnel_type} />
                </Td>
                
                <Td>
                  <VStack align="start" spacing={1}>
                    <HStack spacing={1}>
                      <Text fontSize="sm" color="blue.500">
                        {getNodeName(tunnel.source_node_id)}
                      </Text>
                      <ActivityIcon size={12} />
                      <Text fontSize="sm" color="green.500">
                        {getNodeName(tunnel.target_node_id)}
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.400">
                      {tunnel.source_node_id} → {tunnel.target_node_id}
                    </Text>
                  </VStack>
                </Td>
                
                <Td>
                  <TunnelStatusBadge tunnel={tunnel} />
                </Td>
                
                <Td>
                  <Text fontSize="sm" color="gray.500">
                    {formatDate(tunnel.created_at)}
                  </Text>
                </Td>
                
                <Td>
                  <HStack spacing={1}>
                    <Tooltip label={tunnel.is_active ? t('tunnel.deactivate') : t('tunnel.activate')}>
                      <IconButton
                        aria-label={tunnel.is_active ? t('tunnel.deactivate') : t('tunnel.activate')}
                        icon={tunnel.is_active ? <PauseIconComponent /> : <PlayIconComponent />}
                        size="sm"
                        variant="ghost"
                        colorScheme={tunnel.is_active ? 'orange' : 'green'}
                        onClick={() => handleToggle(tunnel)}
                        isLoading={togglingId === tunnel.id}
                      />
                    </Tooltip>
                    
                    <Tooltip label={t('common.edit')}>
                      <IconButton
                        aria-label={t('common.edit')}
                        icon={<EditIconComponent />}
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(tunnel)}
                      />
                    </Tooltip>
                    
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        aria-label={t('common.more')}
                        icon={<MoreVerticalIcon />}
                        size="sm"
                        variant="ghost"
                      />
                      <MenuList>
                        <MenuItem
                          icon={<TrashIconComponent />}
                          color="red.500"
                          onClick={() => handleDelete(tunnel)}
                        >
                          {t('common.delete')}
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('tunnel.deleteConfirm.title')}
            </AlertDialogHeader>
            <AlertDialogBody>
              {t('tunnel.deleteConfirm.message', { 
                name: tunnelToDelete?.name || `Tunnel ${tunnelToDelete?.id}` 
              })}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDelete}
                ml={3}
                isLoading={deletingId === tunnelToDelete?.id}
                loadingText={t('common.deleting')}
              >
                {t('common.delete')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
