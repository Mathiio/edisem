import { IconSvgProps } from '@/types/types';

export const CreditIcon: React.FC<IconSvgProps> = ({ size = 24, width, height, ...props }) => (
  <svg height={size || height} viewBox='0 0 22 22' width={size || width} {...props}>
    <path
      fill='currentColor'
      fillRule='evenodd'
      clipRule='evenodd'
      d="M11 0C4.939 0 0 4.939 0 11C0 17.061 4.939 22 11 22C17.061 22 22 17.061 22 11C22 4.939 17.061 0 11 0ZM9.9 10.362C9.9 9.911 10.3422 9.35 11 9.35C11.6578 9.35 12.1 9.911 12.1 10.362C12.1 10.362 12.1 11.9176 12.1 12.562C12.1 13.6359 12.1 14.85 12.1 14.85C12.1 15.4 11.6652 15.95 11 15.95C10.3348 15.95 9.9 15.4 9.9 14.85V13.112V10.362ZM12.012 7.48C11.957 7.623 11.88 7.733 11.781 7.843C11.671 7.942 11.55 8.019 11.418 8.074C11.286 8.129 11.143 8.162 11 8.162C10.857 8.162 10.714 8.129 10.582 8.074C10.45 8.019 10.329 7.942 10.219 7.843C10.12 7.733 10.043 7.623 9.988 7.48C9.933 7.348 9.9 7.205 9.9 7.062C9.9 6.919 9.933 6.776 9.988 6.644C10.043 6.512 10.12 6.391 10.219 6.281C10.329 6.182 10.45 6.105 10.582 6.05C10.846 5.94 11.154 5.94 11.418 6.05C11.55 6.105 11.671 6.182 11.781 6.281C11.88 6.391 11.957 6.512 12.012 6.644C12.067 6.776 12.1 6.919 12.1 7.062C12.1 7.205 12.067 7.348 12.012 7.48Z"
    />
  </svg>
);

export const SunIcon: React.FC<IconSvgProps> = ({ size = 24, width, height, ...props }) => (
  <svg height={size || height} viewBox='0 0 22 22' width={size || width} {...props}>
    <path 
      clipRule='evenodd'
      fill='currentColor'
      fillRule='evenodd'
      d="M11 18C14.866 18 18 14.866 18 11C18 7.13401 14.866 4 11 4C7.13401 4 4 7.13401 4 11C4 14.866 7.13401 18 11 18Z"
      />
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      fill='currentColor'
      d="M16.7878 18.8793L16.6638 18.7552C16.0882 18.1797 16.0882 17.2488 16.6638 16.6733C17.2393 16.0978 18.1702 16.0978 18.7457 16.6733L18.8698 16.7974C19.4453 17.3729 19.4453 18.3038 18.8698 18.8793C18.5891 19.1599 18.2174 19.3086 17.8336 19.3086C17.4475 19.3086 17.0817 19.1588 16.7974 18.8886L16.7878 18.8793ZM3.28067 5.3725L3.15135 5.23324C2.58335 4.65715 2.58586 3.73187 3.15887 3.15887C3.73439 2.58334 4.66528 2.58334 5.2408 3.15887L5.36488 3.28294C5.93883 3.8569 5.94039 4.7843 5.36956 5.36018C5.08487 5.65706 4.69976 5.80368 4.32868 5.80368C3.94263 5.80368 3.57685 5.65387 3.2925 5.38374L3.28067 5.3725ZM11.0191 22C10.2349 22 9.54409 21.4031 9.54409 20.5632V20.4868C9.54409 19.6744 10.2067 19.0118 11.0191 19.0118C11.8315 19.0118 12.4941 19.6744 12.4941 20.4868C12.4941 21.2726 11.8575 22 11.0191 22ZM20.5632 12.4941H20.4868C19.6744 12.4941 19.0118 11.8315 19.0118 11.0191C19.0118 10.2067 19.6744 9.54409 20.4868 9.54409C21.2726 9.54409 22 10.1807 22 11.0191C22 11.8033 21.4031 12.4941 20.5632 12.4941ZM1.55135 12.4941H1.475C0.662559 12.4941 0 11.8315 0 11.0191C0 10.2067 0.662559 9.54409 1.475 9.54409C2.26074 9.54409 2.98817 10.1807 2.98817 11.0191C2.98817 11.8033 2.39123 12.4941 1.55135 12.4941ZM11.0191 2.98817C10.2349 2.98817 9.54409 2.39123 9.54409 1.55135V1.475C9.54409 0.662559 10.2067 0 11.0191 0C11.8315 0 12.4941 0.662559 12.4941 1.475C12.4941 2.26074 11.8575 2.98817 11.0191 2.98817Z"
    />
    <path
      fillRule="evenodd" 
      clipRule="evenodd" 
      fill='currentColor' 
      d="M16.6638 3.29248C16.0882 3.868 16.0882 4.7989 16.6638 5.37442L16.6733 5.38374C16.9577 5.65387 17.3235 5.80368 17.7095 5.80368C18.0933 5.80368 18.4651 5.65506 18.7457 5.37442L18.8698 5.25035C19.4453 4.67483 19.4453 3.74393 18.8698 3.16841C18.2942 2.59289 17.3634 2.59289 16.7878 3.16841L16.6638 3.29248Z"
      />
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      fill='currentColor' 
      d="M3.15887 16.7974C2.58334 17.3729 2.58334 18.3038 3.15887 18.8793L3.16842 18.8886C3.45278 19.1588 3.81856 19.3086 4.20461 19.3086C4.57611 19.3086 4.95825 19.1619 5.2408 18.8793L5.36488 18.7552C5.9404 18.1797 5.9404 17.2488 5.36488 16.6733C4.78936 16.0978 3.85846 16.0978 3.28294 16.6733L3.15887 16.7974Z"
      />
  </svg>
);

export const MoonIcon: React.FC<IconSvgProps> = ({ size = 24, width, height, ...props }) => (
  <svg height={size || height} viewBox='0 0 21 22' width={size || width} {...props}>
    <path
      clipRule='evenodd'
      fill='currentColor'
      fillRule='evenodd'
      d="M21.3296 15.3305C21.1562 15.0333 20.6687 14.5711 19.4551 14.7912C18.7833 14.9122 18.1007 14.9673 17.4181 14.9342C14.8935 14.8242 12.6073 13.6466 11.0145 11.8306C9.60594 10.2348 8.73912 8.15465 8.72829 5.90946C8.72829 4.65479 8.96666 3.44415 9.45425 2.29954C9.93099 1.18795 9.5951 0.604643 9.35673 0.362515C9.10752 0.10938 8.52242 -0.242806 7.37389 0.241451C2.9423 2.13446 0.200997 6.64685 0.526052 11.4784C0.851108 16.0238 3.99331 19.9089 8.15402 21.3727C9.15086 21.7249 10.2019 21.934 11.2854 21.978C11.4588 21.989 11.6321 22 11.8055 22C15.4353 22 18.8375 20.2611 20.9829 17.3005C21.7088 16.277 21.5138 15.6276 21.3296 15.3305Z"
    />
  </svg>
);

export const SearchIcon: React.FC<IconSvgProps> = ({ size = 24, width, height, ...props }) => (
  <svg height={size || height} viewBox='0 0 22 22' width={size || width} {...props}>
    <path
      clipRule='evenodd'
      fill='currentColor'
      fillRule='evenodd'
      d="M9.97741 2.97059C5.733 2.97059 2.44444 6.1861 2.44444 9.97032C2.44444 13.7544 5.73366 16.9701 9.97823 16.9701C14.2226 16.9701 17.5112 13.7546 17.5112 9.97032C17.5112 6.18698 14.2219 2.97059 9.97741 2.97059ZM0 9.97032C0 4.65721 4.5516 0.5 9.97741 0.5C15.4032 0.5 19.9556 4.65796 19.9556 9.97032C19.9556 12.1288 19.2044 14.0965 17.9486 15.6722L21.6404 19.3896C22.1186 19.8711 22.12 20.6533 21.6436 21.1366C21.1672 21.6199 20.3933 21.6213 19.9151 21.1398L16.1855 17.3843C14.4704 18.6763 12.3047 19.4406 9.97823 19.4406C4.55257 19.4406 0 15.2836 0 9.97032Z"
    />
  </svg>
);

export const ArrowIcon: React.FC<IconSvgProps> = ({ size = 24, width, height, transform, ...props }) => (
  <svg width={size || width} viewBox='0 0 24 24' height={size || height} style={{ transform }}  {...props}>
    <path
      fill='currentColor'
      fillRule='evenodd'
      clipRule='evenodd'
      d="M11.2929 3.29289C11.6834 2.90237 12.3166 2.90237 12.7071 3.29289L19.7071 10.2929C20.0976 10.6834 20.0976 11.3166 19.7071 11.7071L12.7071 18.7071C12.3166 19.0976 11.6834 19.0976 11.2929 18.7071C10.9024 18.3166 10.9024 17.6834 11.2929 17.2929L16.5858 12H3C2.44772 12 2 11.5523 2 11C2 10.4477 2.44772 10 3 10H16.5858L11.2929 4.70711C10.9024 4.31658 10.9024 3.68342 11.2929 3.29289Z"
    />
  </svg>
);

export const CloseIcon: React.FC<IconSvgProps> = ({ size = 35, width, height, ...props }) => (
  <svg width={size || width} viewBox='0 0 24 24' height={size || height} {...props}>
    <path
      fill='currentColor'
      fillRule='evenodd'
      clipRule='evenodd'
      d="M11 0C4.939 0 0 4.939 0 11C0 17.061 4.939 22 11 22C17.061 22 22 17.061 22 11C22 4.939 17.061 0 11 0ZM14.696 13.53C15.015 13.849 15.015 14.377 14.696 14.696C14.531 14.861 14.322 14.938 14.113 14.938C13.904 14.938 13.695 14.861 13.53 14.696L11 12.166L8.47 14.696C8.305 14.861 8.096 14.938 7.887 14.938C7.678 14.938 7.469 14.861 7.304 14.696C6.985 14.377 6.985 13.849 7.304 13.53L9.834 11L7.304 8.47C6.985 8.151 6.985 7.623 7.304 7.304C7.623 6.985 8.151 6.985 8.47 7.304L11 9.834L13.53 7.304C13.849 6.985 14.377 6.985 14.696 7.304C15.015 7.623 15.015 8.151 14.696 8.47L12.166 11L14.696 13.53Z"
    />
  </svg>
);

export const LinkIcon: React.FC<IconSvgProps> = ({ size = 35, width, height, ...props }) => (
  <svg width={size || width} viewBox='0 0 24 24' height={size || height} {...props}>
    <path
      fill='currentColor'
      fillRule='evenodd'
      clipRule='evenodd'
      d="M13.75 3.75C13.1977 3.75 12.75 3.30228 12.75 2.75C12.75 2.19772 13.1977 1.75 13.75 1.75H19.25C19.8023 1.75 20.25 2.19772 20.25 2.75V8.25C20.25 8.80228 19.8023 9.25 19.25 9.25C18.6977 9.25 18.25 8.80228 18.25 8.25V5.16421L9.87377 13.5404C9.48325 13.931 8.85008 13.931 8.45956 13.5404C8.06904 13.1499 8.06904 12.5168 8.45956 12.1262L16.8358 3.75H13.75ZM4.58333 6.5C4.36232 6.5 4.15036 6.5878 3.99408 6.74408C3.8378 6.90036 3.75 7.11232 3.75 7.33333V17.4167C3.75 17.6377 3.8378 17.8496 3.99408 18.0059C4.15036 18.1622 4.36232 18.25 4.58333 18.25H14.6667C14.8877 18.25 15.0996 18.1622 15.2559 18.0059C15.4122 17.8496 15.5 17.6377 15.5 17.4167V11.9167C15.5 11.3644 15.9477 10.9167 16.5 10.9167C17.0523 10.9167 17.5 11.3644 17.5 11.9167V17.4167C17.5 18.1681 17.2015 18.8888 16.6701 19.4201C16.1388 19.9515 15.4181 20.25 14.6667 20.25H4.58333C3.83189 20.25 3.11122 19.9515 2.57986 19.4201C2.04851 18.8888 1.75 18.1681 1.75 17.4167V7.33333C1.75 6.58189 2.04851 5.86122 2.57986 5.32986C3.11122 4.79851 3.83189 4.5 4.58333 4.5H10.0833C10.6356 4.5 11.0833 4.94772 11.0833 5.5C11.0833 6.05228 10.6356 6.5 10.0833 6.5H4.58333Z"
    />
  </svg>
);

export const MailIcon: React.FC<IconSvgProps> = ({ size = 35, width, height, ...props }) => (
  <svg width={size || width} viewBox='0 0 24 24' height={size || height} {...props}>
    <mask 
      id="path-1-inside-1_447_2624" 
      fill="white">
    <path 
      fill='currentColor'
      fillRule='evenodd'
      clipRule='evenodd'
      d="M16 4.5H6C4.80659 4.5 4.11761 4.79864 3.7359 5.15309C3.38103 5.48261 3 6.1312 3 7.5V14.5C3 15.8688 3.38103 16.5174 3.7359 16.8469C4.11761 17.2014 4.80659 17.5 6 17.5H16C17.1934 17.5 17.8824 17.2014 18.2641 16.8469C18.619 16.5174 19 15.8688 19 14.5V7.5C19 6.1312 18.619 5.48261 18.2641 5.15309C17.8824 4.79864 17.1934 4.5 16 4.5ZM16 2.5H6C3 2.5 1 4 1 7.5V14.5C1 18 3 19.5 6 19.5H16C19 19.5 21 18 21 14.5V7.5C21 4 19 2.5 16 2.5Z"/>
    <path 
      fill='currentColor'
      fillRule='evenodd'
      clipRule='evenodd'
      d="M16.7112 9.45155L13.4438 12.1479C12.7548 12.7196 11.8779 13 11.001 13C10.1241 13 9.23675 12.7196 8.5582 12.1479L5.29072 9.45155C4.95667 9.17113 4.90447 8.65342 5.16545 8.30828C5.43687 7.96315 5.92752 7.89843 6.26157 8.17886L9.52905 10.8752C10.3224 11.5332 11.6691 11.5332 12.4625 10.8752L15.7299 8.17886C16.064 7.89843 16.5651 7.95236 16.8261 8.30828C17.0975 8.65342 17.0453 9.17113 16.7112 9.45155Z"/>
    </mask>
    <path 
      fill='currentColor'
      fillRule='evenodd'
      clipRule='evenodd'
      d="M3.7359 5.15309L2.375 3.6875L2.375 3.6875L3.7359 5.15309ZM3.7359 16.8469L2.375 18.3125H2.375L3.7359 16.8469ZM18.2641 16.8469L16.9032 15.3813L16.9032 15.3813L18.2641 16.8469ZM18.2641 5.15309L16.9032 6.61867L16.9032 6.61868L18.2641 5.15309ZM16.7112 9.45155L17.9842 10.9941L17.9907 10.9888L17.9971 10.9834L16.7112 9.45155ZM13.4438 12.1479L12.1708 10.6054L12.1667 10.6087L13.4438 12.1479ZM8.5582 12.1479L9.84677 10.6184L9.839 10.6118L9.83117 10.6054L8.5582 12.1479ZM5.29072 9.45155L4.00483 10.9834L4.01127 10.9888L4.01775 10.9941L5.29072 9.45155ZM5.16545 8.30828L3.59335 7.07197L3.58162 7.08687L3.57018 7.102L5.16545 8.30828ZM6.26157 8.17886L4.97567 9.71068L4.98212 9.71608L4.9886 9.72144L6.26157 8.17886ZM9.52905 10.8752L10.8057 9.33572L10.802 9.33267L9.52905 10.8752ZM12.4625 10.8752L11.1895 9.33266L11.1858 9.33572L12.4625 10.8752ZM15.7299 8.17886L17.0029 9.72144L17.0094 9.71608L17.0158 9.71068L15.7299 8.17886ZM16.8261 8.30828L15.2132 9.49092L15.2331 9.51811L15.254 9.5446L16.8261 8.30828ZM6 6.5H16V2.5H6V6.5ZM5.0968 6.61867C4.98804 6.71967 5.11851 6.5 6 6.5V2.5C4.49467 2.5 3.24718 2.87762 2.375 3.6875L5.0968 6.61867ZM5 7.5C5 6.99663 5.07055 6.73825 5.10884 6.63556C5.14146 6.54809 5.1518 6.5676 5.0968 6.61867L2.375 3.6875C1.50408 4.49621 1 5.74281 1 7.5H5ZM5 14.5V7.5H1V14.5H5ZM5.0968 15.3813C5.1518 15.4324 5.14146 15.4519 5.10884 15.3644C5.07055 15.2618 5 15.0034 5 14.5H1C1 16.2572 1.50408 17.5038 2.375 18.3125L5.0968 15.3813ZM6 15.5C5.11851 15.5 4.98804 15.2803 5.0968 15.3813L2.375 18.3125C3.24718 19.1224 4.49467 19.5 6 19.5V15.5ZM16 15.5H6V19.5H16V15.5ZM16.9032 15.3813C17.012 15.2803 16.8815 15.5 16 15.5V19.5C17.5053 19.5 18.7528 19.1224 19.625 18.3125L16.9032 15.3813ZM17 14.5C17 15.0034 16.9294 15.2618 16.8912 15.3644C16.8585 15.4519 16.8482 15.4324 16.9032 15.3813L19.625 18.3125C20.4959 17.5038 21 16.2572 21 14.5H17ZM17 7.5V14.5H21V7.5H17ZM16.9032 6.61868C16.8482 6.5676 16.8585 6.54809 16.8912 6.63556C16.9294 6.73825 17 6.99663 17 7.5H21C21 5.74281 20.4959 4.49621 19.625 3.6875L16.9032 6.61868ZM16 6.5C16.8815 6.5 17.012 6.71967 16.9032 6.61867L19.625 3.6875C18.7528 2.87762 17.5053 2.5 16 2.5V6.5ZM6 4.5H16V0.5H6V4.5ZM3 7.5C3 6.1312 3.38103 5.48261 3.7359 5.15309C4.11761 4.79864 4.80659 4.5 6 4.5V0.5C4.19341 0.5 2.38239 0.951357 1.0141 2.22191C-0.381026 3.51739 -1 5.3688 -1 7.5H3ZM3 14.5V7.5H-1V14.5H3ZM6 17.5C4.80659 17.5 4.11761 17.2014 3.7359 16.8469C3.38103 16.5174 3 15.8688 3 14.5H-1C-1 16.6312 -0.381026 18.4826 1.0141 19.7781C2.38239 21.0486 4.19341 21.5 6 21.5V17.5ZM16 17.5H6V21.5H16V17.5ZM19 14.5C19 15.8688 18.619 16.5174 18.2641 16.8469C17.8824 17.2014 17.1934 17.5 16 17.5V21.5C17.8066 21.5 19.6176 21.0486 20.9859 19.7781C22.381 18.4826 23 16.6312 23 14.5H19ZM19 7.5V14.5H23V7.5H19ZM16 4.5C17.1934 4.5 17.8824 4.79864 18.2641 5.15309C18.619 5.48261 19 6.1312 19 7.5H23C23 5.3688 22.381 3.51739 20.9859 2.22191C19.6176 0.951357 17.8066 0.5 16 0.5V4.5ZM15.4383 7.90897L12.1708 10.6054L14.7167 13.6905L17.9842 10.9941L15.4383 7.90897ZM12.1667 10.6087C11.874 10.8516 11.4624 11 11.001 11V15C12.2934 15 13.6356 14.5875 14.7208 13.6872L12.1667 10.6087ZM11.001 11C10.5306 11 10.1179 10.8468 9.84677 10.6184L7.26963 13.6775C8.35562 14.5924 9.71758 15 11.001 15V11ZM9.83117 10.6054L6.56369 7.90897L4.01775 10.9941L7.28523 13.6905L9.83117 10.6054ZM6.57662 7.91973C6.8408 8.1415 6.96597 8.43286 6.99363 8.69171C7.02108 8.94863 6.96111 9.24956 6.76072 9.51457L3.57018 7.102C2.68036 8.27876 2.83802 10.0039 4.00483 10.9834L6.57662 7.91973ZM6.73756 9.5446C6.35545 10.0305 5.56124 10.2022 4.97567 9.71068L7.54747 6.64704C6.29379 5.59464 4.51829 5.8958 3.59335 7.07197L6.73756 9.5446ZM4.9886 9.72144L8.25608 12.4178L10.802 9.33267L7.53454 6.63628L4.9886 9.72144ZM8.25238 12.4148C9.0679 13.091 10.0788 13.3687 10.9958 13.3687C11.9127 13.3687 12.9236 13.091 13.7391 12.4148L11.1858 9.33572C11.2009 9.32322 11.1954 9.33254 11.1565 9.34532C11.1174 9.35816 11.0615 9.36869 10.9958 9.36869C10.93 9.36869 10.8741 9.35816 10.835 9.34532C10.7961 9.33254 10.7906 9.32322 10.8057 9.33572L8.25238 12.4148ZM13.7354 12.4178L17.0029 9.72144L14.457 6.63628L11.1895 9.33267L13.7354 12.4178ZM17.0158 9.71068C16.4811 10.1596 15.6487 10.0849 15.2132 9.49092L18.4389 7.12565C17.4814 5.8198 15.6469 5.63728 14.444 6.64704L17.0158 9.71068ZM15.254 9.5446C14.8644 9.04923 14.9245 8.34018 15.4253 7.91973L17.9971 10.9834C19.1661 10.0021 19.3306 8.25761 18.3982 7.07197L15.254 9.5446Z"
      mask="url(#path-1-inside-1_447_2624)"/>
  </svg>
);

export const CameraIcon: React.FC<IconSvgProps> = ({ size = 35, width, height, ...props }) => (
  <svg width={size || width} viewBox='0 0 24 24' height={size || height} {...props}>
    <path 
      fill='currentColor'
      fillRule='evenodd'
      clipRule='evenodd'
      d="M12.023 3.06897H5.885C1.375 3.06897 0 4.44397 0 8.95397V13.046C0 17.556 1.375 18.931 5.885 18.931H12.023C16.533 18.931 17.908 17.556 17.908 13.046V8.95397C17.908 4.44397 16.533 3.06897 12.023 3.06897Z"/>
          <path 
      fill='currentColor'
      fillRule='evenodd'
      clipRule='evenodd'
      d="M20.262 7.69997C20.108 7.68897 19.91 7.67797 19.69 7.67797C19.261 7.67797 18.92 8.01897 18.92 8.44797V13.563C18.92 13.992 19.261 14.333 19.69 14.333C19.91 14.333 20.097 14.322 20.284 14.311C22 14.113 22 12.903 22 12.023V9.97697C22 9.09697 22 7.88697 20.262 7.69997Z"/>
  </svg>
);

export const ImageIcon: React.FC<IconSvgProps> = ({ size = 35, width, height, ...props }) => (
  <svg width={size || width} viewBox='0 0 24 24' height={size || height} {...props}>
    <path 
      fill='currentColor'
      fillRule='evenodd'
      clipRule='evenodd'
      d="M22 19.5556V2.44444C22 1.1 20.9 0 19.5556 0H2.44444C1.1 0 0 1.1 0 2.44444V19.5556C0 20.9 1.1 22 2.44444 22H19.5556C20.9 22 22 20.9 22 19.5556ZM7.21111 13.42L9.77778 16.5122L13.5667 11.6356C13.8111 11.3178 14.3 11.3178 14.5444 11.6478L18.8344 17.3678C19.14 17.7711 18.8467 18.3456 18.3456 18.3456H3.69111C3.17778 18.3456 2.89667 17.7589 3.21444 17.3556L6.25778 13.4444C6.49 13.1267 6.95444 13.1144 7.21111 13.42Z"/>
  </svg>
);

export const SoundIcon: React.FC<IconSvgProps> = ({ size = 35, width, height, ...props }) => (
  <svg width={size || width} viewBox='0 0 24 24' height={size || height} {...props}>
    <path 
      fill='currentColor'
      fillRule='evenodd'
      clipRule='evenodd'
      d="M11.8651 2.97006C11.8651 2.51147 11.7393 1.75964 11.0402 1.41339C10.298 1.04581 9.60709 1.46134 9.25706 1.7707L3.90225 6.56183H1.97752C0.885365 6.56183 0 7.43281 0 8.50723L9.90102e-06 13.5532C9.90102e-06 14.6276 0.885375 15.4986 1.97753 15.4986H3.90561L9.25706 20.2302C9.60827 20.5404 10.2989 20.9538 11.0401 20.5865C11.7383 20.2406 11.8651 19.4904 11.8651 19.0308V2.97006Z"/>
      <path 
      fill='currentColor'
      fillRule='evenodd'
      clipRule='evenodd'
      d="M16.1524 3.02011L15.9143 2.95475C15.3884 2.81036 14.843 3.11277 14.6961 3.63022L14.5633 4.09868C14.4165 4.61611 14.7239 5.15264 15.2499 5.29702L15.488 5.36238C17.7533 5.98423 19.5281 8.22415 19.5281 11.0002C19.5281 13.7762 17.7533 16.0161 15.488 16.638L15.2499 16.7032C14.7239 16.8477 14.4165 17.3842 14.5633 17.9016L14.6961 18.3701C14.843 18.8875 15.3884 19.1899 15.9143 19.0456L16.1524 18.9802C19.5732 18.0412 22 14.7759 22 11.0002C22 7.22438 19.5732 3.95916 16.1524 3.02011Z"/>
      <path 
      fill='currentColor'
      fillRule='evenodd'
      clipRule='evenodd'
      d="M15.1855 6.91708L14.9486 6.84742C14.4254 6.69354 13.8745 6.98604 13.7181 7.50074L13.5765 7.96671C13.42 8.4814 13.7174 9.02339 14.2405 9.17726L14.4774 9.2469C15.0046 9.40205 15.573 10.0391 15.573 11.0001C15.573 11.9612 15.0046 12.5982 14.4774 12.7533L14.2405 12.8229C13.7174 12.9768 13.42 13.5188 13.5765 14.0335L13.7181 14.4995C13.8745 15.0141 14.4254 15.3066 14.9486 15.1528L15.1855 15.0831C16.9326 14.5692 18.0449 12.847 18.0449 11.0001C18.0449 9.15333 16.9326 7.43095 15.1855 6.91708Z"/>
  </svg>
);