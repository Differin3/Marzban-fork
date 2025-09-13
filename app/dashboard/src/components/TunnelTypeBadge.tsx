import { Badge, HStack, Text } from "@chakra-ui/react";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { getTunnelTypeIcon } from "./TunnelIcons";

interface TunnelTypeBadgeProps {
  tunnelType: string;
  compact?: boolean;
}

export const TunnelTypeBadge: FC<TunnelTypeBadgeProps> = ({
  tunnelType,
  compact = false,
}) => {
  const { t } = useTranslation();
  const TypeIcon = getTunnelTypeIcon(tunnelType);
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'wireguard':
        return 'blue';
      case 'openvpn':
        return 'purple';
      case 'ipsec':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'wireguard':
        return 'WireGuard';
      case 'openvpn':
        return 'OpenVPN';
      case 'ipsec':
        return 'IPSec';
      default:
        return type;
    }
  };

  return (
    <Badge
      colorScheme={getTypeColor(tunnelType)}
      rounded="full"
      display="inline-flex"
      px={3}
      py={1}
      columnGap={compact ? 1 : 2}
      alignItems="center"
      variant="subtle"
    >
      <TypeIcon size={compact ? 12 : 16} />
      {!compact && (
        <Text
          fontSize=".875rem"
          lineHeight="1.25rem"
          fontWeight="medium"
          letterSpacing="tighter"
        >
          {getTypeText(tunnelType)}
        </Text>
      )}
    </Badge>
  );
};
