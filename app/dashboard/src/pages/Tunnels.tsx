import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  useToast,
  Spinner,
  Center,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Badge,
  Divider
} from "@chakra-ui/react";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  PlusIcon,
  WifiIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  LockClosedIcon,
  ActivityIcon as ActivityIconHero
} from "@heroicons/react/24/outline";
import { chakra } from "@chakra-ui/react";
import { Tunnel, TunnelCreate, TunnelUpdate, Node } from "types/Tunnel";
import { TunnelsTable } from "components/TunnelsTable";
import { TunnelDialog } from "components/TunnelDialog";
import { ActivityIcon, LinkIcon } from "components/TunnelIcons";

const iconProps = {
  baseStyle: {
    w: 5,
    h: 5,
  },
};

const PlusIconComponent = chakra(PlusIcon, iconProps);
const WifiIconComponent = chakra(WifiIcon, iconProps);
const ShieldCheckIconComponent = chakra(ShieldCheckIcon, iconProps);
const GlobeAltIconComponent = chakra(GlobeAltIcon, iconProps);
const LockClosedIconComponent = chakra(LockClosedIcon, iconProps);
const ActivityIconComponent = chakra(ActivityIconHero, iconProps);

export const Tunnels: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  
  const [tunnels, setTunnels] = useState<Tunnel[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTunnel, setEditingTunnel] = useState<Tunnel | null>(null);

  // Fetch tunnels
  const fetchTunnels = async () => {
    try {
      // Проверяем, существует ли API эндпоинт
      const checkResponse = await fetch('/api/tunnels');
      if (checkResponse.status === 404) {
        // Если эндпоинт не существует, показываем сообщение об ошибке
        toast({
          title: t('tunnel.error.apiNotFound'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      
      const response = await fetch('/api/tunnels');
      if (response.ok) {
        const data = await response.json();
        setTunnels(data);
      } else {
        throw new Error('Failed to fetch tunnels');
      }
    } catch (error) {
      toast({
        title: t('tunnel.error.fetchFailed'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Fetch nodes
  const fetchNodes = async () => {
    try {
      const response = await fetch('/api/nodes');
      if (response.ok) {
        const data = await response.json();
        setNodes(data);
      } else {
        throw new Error('Failed to fetch nodes');
      }
    } catch (error) {
      toast({
        title: t('tunnel.error.fetchNodesFailed'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchTunnels(), fetchNodes()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Create tunnel
  const handleCreateTunnel = async (tunnelData: TunnelCreate) => {
    try {
      const response = await fetch('/api/tunnels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tunnelData),
      });

      if (response.ok) {
        await fetchTunnels();
        return;
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create tunnel');
      }
    } catch (error) {
      throw error;
    }
  };

  // Update tunnel
  const handleUpdateTunnel = async (tunnelData: TunnelUpdate) => {
    if (!editingTunnel) return;

    try {
      const response = await fetch(`/api/tunnels/${editingTunnel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tunnelData),
      });

      if (response.ok) {
        await fetchTunnels();
        return;
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update tunnel');
      }
    } catch (error) {
      throw error;
    }
  };

  // Delete tunnel
  const handleDeleteTunnel = async (tunnelId: number) => {
    try {
      const response = await fetch(`/api/tunnels/${tunnelId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTunnels();
        return;
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete tunnel');
      }
    } catch (error) {
      throw error;
    }
  };

  // Toggle tunnel active status
  const handleToggleTunnel = async (tunnelId: number, isActive: boolean) => {
    try {
      const endpoint = isActive ? 'activate' : 'deactivate';
      const response = await fetch(`/api/tunnels/${tunnelId}/${endpoint}`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchTunnels();
        return;
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to toggle tunnel');
      }
    } catch (error) {
      throw error;
    }
  };

  // Handle edit tunnel
  const handleEditTunnel = (tunnel: Tunnel) => {
    setEditingTunnel(tunnel);
    setIsDialogOpen(true);
  };

  // Handle create tunnel
  const handleCreateClick = () => {
    setEditingTunnel(null);
    setIsDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingTunnel(null);
  };

  // Handle save tunnel
  const handleSaveTunnel = async (tunnelData: TunnelCreate | TunnelUpdate) => {
    if (editingTunnel) {
      await handleUpdateTunnel(tunnelData as TunnelUpdate);
    } else {
      await handleCreateTunnel(tunnelData as TunnelCreate);
    }
  };

  // Calculate statistics
  const stats = {
    total: tunnels.length,
    active: tunnels.filter(t => t.status === 'active').length,
    inactive: tunnels.filter(t => t.status === 'inactive').length,
    error: tunnels.filter(t => t.status === 'error').length,
    connecting: tunnels.filter(t => t.status === 'connecting').length,
  };

  const tunnelTypes = {
    wireguard: tunnels.filter(t => t.tunnel_type === 'wireguard').length,
    openvpn: tunnels.filter(t => t.tunnel_type === 'openvpn').length,
    ipsec: tunnels.filter(t => t.tunnel_type === 'ipsec').length,
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

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <HStack justify="space-between" mb={4}>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="bold">
              {t('tunnel.title')}
            </Text>
            <Text color="gray.500">
              {t('tunnel.subtitle')}
            </Text>
          </VStack>
          <Button
            leftIcon={<PlusIconComponent />}
            colorScheme="blue"
            onClick={handleCreateClick}
            size="lg"
          >
            {t('tunnel.create')}
          </Button>
        </HStack>

        {/* Statistics */}
        <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={4} mb={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>{t('tunnel.stats.total')}</StatLabel>
                <StatNumber>{stats.total}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {t('tunnel.stats.tunnels')}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="green.500">{t('tunnel.stats.active')}</StatLabel>
                <StatNumber color="green.500">{stats.active}</StatNumber>
                <StatHelpText>
                  <ActivityIconComponent />
                  {t('tunnel.stats.running')}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="gray.500">{t('tunnel.stats.inactive')}</StatLabel>
                <StatNumber color="gray.500">{stats.inactive}</StatNumber>
                <StatHelpText>
                  {t('tunnel.stats.stopped')}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="red.500">{t('tunnel.stats.error')}</StatLabel>
                <StatNumber color="red.500">{stats.error}</StatNumber>
                <StatHelpText>
                  {t('tunnel.stats.failed')}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="blue.500">WireGuard</StatLabel>
                <StatNumber color="blue.500">{tunnelTypes.wireguard}</StatNumber>
                <StatHelpText>
                  <ShieldCheckIconComponent />
                  {t('tunnel.stats.wireguard')}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="purple.500">OpenVPN</StatLabel>
                <StatNumber color="purple.500">{tunnelTypes.openvpn}</StatNumber>
                <StatHelpText>
                  <GlobeAltIconComponent />
                  {t('tunnel.stats.openvpn')}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>

      <Divider />

      {/* Tunnels Table */}
      <Box>
        <TunnelsTable
          tunnels={tunnels}
          nodes={nodes}
          isLoading={isLoading}
          onEdit={handleEditTunnel}
          onDelete={handleDeleteTunnel}
          onToggle={handleToggleTunnel}
          onRefresh={fetchTunnels}
        />
      </Box>

      {/* Tunnel Dialog */}
      <TunnelDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSave={handleSaveTunnel}
        tunnel={editingTunnel}
        nodes={nodes}
        isLoading={isLoading}
      />
    </VStack>
  );
};

export default Tunnels;
