export type RoleModalProps = {
  onDone: () => void;
  onClose: () => void;
};

export type PermissionOption = {
  permission: string;
  label: string;
  on: boolean;
};

export type RoleModalViewProps = {
  name: string;
  onChangeName: (value: string) => void;
  permissionOptions: PermissionOption[];
  onTogglePermission: (permission: string, on: boolean) => void;
  valid: boolean;
  saving: boolean;
  onSubmit: () => void;
  onClose: () => void;
};
