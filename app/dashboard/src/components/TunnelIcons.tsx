import { chakra } from "@chakra-ui/react";
import { FC } from "react";
import {
  ActivityIcon as ActivityIconHero,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  GlobeAltIcon,
  LinkIcon as LinkIconHero,
  LockClosedIcon,
  PauseIcon as PauseIconHero,
  PlayIcon as PlayIconHero,
  Cog6ToothIcon,
  ShieldCheckIcon,
  TrashIcon,
  WifiIcon as WifiIconHero,
  XMarkIcon
} from "@heroicons/react/24/outline";

const iconProps = {
  baseStyle: {
    w: 4,
    h: 4,
  },
};

// Tunnel type icons
export const WireGuardIcon = chakra(ShieldCheckIcon, iconProps);
export const OpenVPNIcon = chakra(GlobeAltIcon, iconProps);
export const IPSecIcon = chakra(LockClosedIcon, iconProps);

// Status icons
export const ActiveIcon = chakra(CheckCircleIcon, {
  ...iconProps,
  baseStyle: {
    ...iconProps.baseStyle,
    color: "green.500",
  },
});

export const InactiveIcon = chakra(PauseIcon, {
  ...iconProps,
  baseStyle: {
    ...iconProps.baseStyle,
    color: "gray.500",
  },
});

export const ErrorIcon = chakra(ExclamationCircleIcon, {
  ...iconProps,
  baseStyle: {
    ...iconProps.baseStyle,
    color: "red.500",
  },
});

export const ConnectingIcon = chakra(ClockIcon, {
  ...iconProps,
  baseStyle: {
    ...iconProps.baseStyle,
    color: "yellow.500",
  },
});

// Action icons
export const PlayIcon = chakra(PlayIconHero, iconProps);
export const PauseIcon = chakra(PauseIconHero, iconProps);
export const SettingsIcon = chakra(Cog6ToothIcon, iconProps);
export const DeleteIcon = chakra(TrashIcon, iconProps);
export const LinkIcon = chakra(LinkIconHero, iconProps);
export const WifiIcon = chakra(WifiIconHero, iconProps);
export const ActivityIcon = chakra(ActivityIconHero, iconProps);
export const CloseIcon = chakra(XMarkIcon, iconProps);

// Tunnel type icon mapper
export const getTunnelTypeIcon = (type: string) => {
  switch (type) {
    case 'wireguard':
      return WireGuardIcon;
    case 'openvpn':
      return OpenVPNIcon;
    case 'ipsec':
      return IPSecIcon;
    default:
      return LinkIcon;
  }
};

// Status icon mapper
export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return ActiveIcon;
    case 'inactive':
      return InactiveIcon;
    case 'error':
      return ErrorIcon;
    case 'connecting':
      return ConnectingIcon;
    default:
      return InactiveIcon;
  }
};
