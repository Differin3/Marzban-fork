import { Badge, HStack, Text } from "@chakra-ui/react";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { getStatusIcon } from "./TunnelIcons";
import { Tunnel } from "types/Tunnel";

interface TunnelStatusBadgeProps {
  tunnel: Tunnel;
  compact?: boolean;
  showDetail?: boolean;
}

export const TunnelStatusBadge: FC<TunnelStatusBadgeProps> = ({
  tunnel,
  compact = false,
  showDetail = true,
}) => {
  const { t } = useTranslation();
  const StatusIcon = getStatusIcon(tunnel.status);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'gray';
      case 'error':
        return 'red';
      case 'connecting':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return t('tunnel.status.active');
      case 'inactive':
        return t('tunnel.status.inactive');
      case 'error':
        return t('tunnel.status.error');
      case 'connecting':
        return t('tunnel.status.connecting');
      default:
        return t('tunnel.status.unknown');
    }
  };

  return (
    <HStack spacing={2}>
      <Badge
        colorScheme={getStatusColor(tunnel.status)}
        rounded="full"
        display="inline-flex"
        px={3}
        py={1}
        columnGap={compact ? 1 : 2}
        alignItems="center"
        variant={tunnel.status === 'active' ? 'solid' : 'subtle'}
      >
        <StatusIcon size={compact ? 12 : 16} />
        {showDetail && (
          <Text
            textTransform="capitalize"
            fontSize={compact ? ".7rem" : ".875rem"}
            lineHeight={compact ? "1rem" : "1.25rem"}
            fontWeight="medium"
            letterSpacing="tighter"
          >
            {getStatusText(tunnel.status)}
          </Text>
        )}
      </Badge>
      {!tunnel.is_active && (
        <Badge
          colorScheme="gray"
          variant="outline"
          fontSize="xs"
          px={2}
          py={1}
        >
          {t('tunnel.disabled')}
        </Badge>
      )}
    </HStack>
  );
};
