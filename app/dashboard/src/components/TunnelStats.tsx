import {
  Box,
  Card,
  CardBody,
  HStack,
  Text,
  VStack,
  Badge,
  Icon,
  Link as ChakraLink,
  useColorModeValue
} from "@chakra-ui/react";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  WifiIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  LockClosedIcon,
  ActivityIcon as ActivityIconHero
} from "@heroicons/react/24/outline";
import { chakra } from "@chakra-ui/react";
import { Tunnel } from "types/Tunnel";

const iconProps = {
  baseStyle: {
    w: 5,
    h: 5,
  },
};

const WifiIconComponent = chakra(WifiIcon, iconProps);
const ShieldCheckIconComponent = chakra(ShieldCheckIcon, iconProps);
const GlobeAltIconComponent = chakra(GlobeAltIcon, iconProps);
const LockClosedIconComponent = chakra(LockClosedIcon, iconProps);
const ActivityIconComponent = chakra(ActivityIconHero, iconProps);

interface TunnelStatsProps {
  className?: string;
}

export const TunnelStats: FC<TunnelStatsProps> = ({ className }) => {
  const { t } = useTranslation();
  const [tunnels, setTunnels] = useState<Tunnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    const fetchTunnels = async () => {
      try {
        const response = await fetch('/api/tunnels?limit=10');
        if (response.ok) {
          const data = await response.json();
          setTunnels(data);
        }
      } catch (error) {
        console.error('Failed to fetch tunnels:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTunnels();
  }, []);

  if (isLoading) {
    return (
      <Card className={className} bg={cardBg} borderColor={borderColor}>
        <CardBody>
          <Text color="gray.500">{t('tunnel.loading')}</Text>
        </CardBody>
      </Card>
    );
  }

  const stats = {
    total: tunnels.length,
    active: tunnels.filter(t => t.status === 'active').length,
    inactive: tunnels.filter(t => t.status === 'inactive').length,
    error: tunnels.filter(t => t.status === 'error').length,
  };

  const tunnelTypes = {
    wireguard: tunnels.filter(t => t.tunnel_type === 'wireguard').length,
    openvpn: tunnels.filter(t => t.tunnel_type === 'openvpn').length,
    ipsec: tunnels.filter(t => t.tunnel_type === 'ipsec').length,
  };

  return (
    <Card className={className} bg={cardBg} borderColor={borderColor}>
      <CardBody>
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between">
            <HStack spacing={2}>
              <WifiIconComponent color="blue.500" />
              <Text fontWeight="semibold" fontSize="lg">
                {t('tunnel.title')}
              </Text>
            </HStack>
            <ChakraLink as={Link} to="/tunnels" color="blue.500" fontSize="sm">
              {t('common.viewAll')}
            </ChakraLink>
          </HStack>

          <HStack justify="space-between" wrap="wrap" gap={2}>
            <VStack align="center" spacing={1}>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {stats.total}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {t('tunnel.stats.total')}
              </Text>
            </VStack>

            <VStack align="center" spacing={1}>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {stats.active}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {t('tunnel.stats.active')}
              </Text>
            </VStack>

            <VStack align="center" spacing={1}>
              <Text fontSize="2xl" fontWeight="bold" color="gray.500">
                {stats.inactive}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {t('tunnel.stats.inactive')}
              </Text>
            </VStack>

            <VStack align="center" spacing={1}>
              <Text fontSize="2xl" fontWeight="bold" color="red.500">
                {stats.error}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {t('tunnel.stats.error')}
              </Text>
            </VStack>
          </HStack>

          <HStack justify="center" wrap="wrap" gap={2}>
            {tunnelTypes.wireguard > 0 && (
              <Badge colorScheme="blue" variant="subtle" px={2} py={1}>
                <HStack spacing={1}>
                  <ShieldCheckIconComponent w={3} h={3} />
                  <Text fontSize="xs">WireGuard: {tunnelTypes.wireguard}</Text>
                </HStack>
              </Badge>
            )}
            {tunnelTypes.openvpn > 0 && (
              <Badge colorScheme="purple" variant="subtle" px={2} py={1}>
                <HStack spacing={1}>
                  <GlobeAltIconComponent w={3} h={3} />
                  <Text fontSize="xs">OpenVPN: {tunnelTypes.openvpn}</Text>
                </HStack>
              </Badge>
            )}
            {tunnelTypes.ipsec > 0 && (
              <Badge colorScheme="orange" variant="subtle" px={2} py={1}>
                <HStack spacing={1}>
                  <LockClosedIconComponent w={3} h={3} />
                  <Text fontSize="xs">IPSec: {tunnelTypes.ipsec}</Text>
                </HStack>
              </Badge>
            )}
          </HStack>

          {tunnels.length === 0 && (
            <VStack spacing={2} py={4}>
              <ActivityIconComponent w={8} h={8} color="gray.400" />
              <Text fontSize="sm" color="gray.500" textAlign="center">
                {t('tunnel.noTunnels')}
              </Text>
              <ChakraLink as={Link} to="/tunnels" color="blue.500" fontSize="sm">
                {t('tunnel.createFirst')}
              </ChakraLink>
            </VStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};
