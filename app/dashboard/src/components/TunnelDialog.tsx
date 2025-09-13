import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Textarea,
  VStack,
  HStack,
  Text,
  useToast,
  Spinner,
  Box
} from "@chakra-ui/react";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Tunnel, TunnelCreate, TunnelUpdate, Node } from "types/Tunnel";
import { WireGuardIcon, OpenVPNIcon, IPSecIcon } from "./TunnelIcons";

interface TunnelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tunnel: TunnelCreate | TunnelUpdate) => Promise<void>;
  tunnel?: Tunnel | null;
  nodes: Node[];
  isLoading?: boolean;
}

export const TunnelDialog: FC<TunnelDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  tunnel,
  nodes,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    source_node_id: '',
    target_node_id: '',
    tunnel_type: 'wireguard' as 'wireguard' | 'openvpn' | 'ipsec',
    config: '{}',
    is_active: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tunnel) {
      setFormData({
        name: tunnel.name || '',
        source_node_id: tunnel.source_node_id.toString(),
        target_node_id: tunnel.target_node_id.toString(),
        tunnel_type: tunnel.tunnel_type,
        config: tunnel.config,
        is_active: tunnel.is_active,
      });
    } else {
      setFormData({
        name: '',
        source_node_id: '',
        target_node_id: '',
        tunnel_type: 'wireguard',
        config: '{}',
        is_active: true,
      });
    }
  }, [tunnel, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.source_node_id || !formData.target_node_id) {
      toast({
        title: t('tunnel.error.missingNodes'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (formData.source_node_id === formData.target_node_id) {
      toast({
        title: t('tunnel.error.sameNodes'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const tunnelData = {
        ...formData,
        source_node_id: parseInt(formData.source_node_id),
        target_node_id: parseInt(formData.target_node_id),
      };

      await onSave(tunnelData);
      
      toast({
        title: tunnel ? t('tunnel.updated') : t('tunnel.created'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: t('tunnel.error.saveFailed'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTunnelTypeIcon = (type: string) => {
    switch (type) {
      case 'wireguard':
        return <WireGuardIcon size={20} />;
      case 'openvpn':
        return <OpenVPNIcon size={20} />;
      case 'ipsec':
        return <IPSecIcon size={20} />;
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <HStack>
              {getTunnelTypeIcon(formData.tunnel_type)}
              <Text>
                {tunnel ? t('tunnel.edit') : t('tunnel.create')}
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>{t('tunnel.name')}</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('tunnel.namePlaceholder')}
                />
              </FormControl>

              <HStack width="100%" spacing={4}>
                <FormControl isRequired>
                  <FormLabel>{t('tunnel.sourceNode')}</FormLabel>
                  <Select
                    value={formData.source_node_id}
                    onChange={(e) => setFormData({ ...formData, source_node_id: e.target.value })}
                    placeholder={t('tunnel.selectNode')}
                  >
                    {nodes.map((node) => (
                      <option key={node.id} value={node.id}>
                        {node.name} ({node.address})
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>{t('tunnel.targetNode')}</FormLabel>
                  <Select
                    value={formData.target_node_id}
                    onChange={(e) => setFormData({ ...formData, target_node_id: e.target.value })}
                    placeholder={t('tunnel.selectNode')}
                  >
                    {nodes.map((node) => (
                      <option key={node.id} value={node.id}>
                        {node.name} ({node.address})
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>{t('tunnel.type')}</FormLabel>
                <Select
                  value={formData.tunnel_type}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    tunnel_type: e.target.value as 'wireguard' | 'openvpn' | 'ipsec' 
                  })}
                >
                  <option value="wireguard">WireGuard</option>
                  <option value="openvpn">OpenVPN</option>
                  <option value="ipsec">IPSec</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>{t('tunnel.config')}</FormLabel>
                <Textarea
                  value={formData.config}
                  onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                  placeholder={t('tunnel.configPlaceholder')}
                  rows={4}
                  fontFamily="mono"
                  fontSize="sm"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={2}>
              <Button variant="ghost" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isSubmitting}
                loadingText={t('common.saving')}
                disabled={isLoading}
              >
                {tunnel ? t('common.update') : t('common.create')}
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
