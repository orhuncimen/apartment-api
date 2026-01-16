import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Autocomplete,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useQuery } from "@tanstack/react-query";
import type { AppUser, AppUserRequest } from "../../api/userApi";
import { getCustomers, type Customer } from "../../api/customerApi";
import { getRoles, type AppRole } from "../../api/roleApi";

type FieldErrors = Partial<Record<keyof AppUserRequest, string>>;

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: AppUser | null;
  onClose: () => void;
  onSubmit: (payload: AppUserRequest) => void;
  isSubmitting?: boolean;

  fieldErrors?: FieldErrors;
  onClearFieldError?: (field: keyof AppUserRequest) => void;
};

export default function UserFormDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  isSubmitting,
  fieldErrors,
  onClearFieldError,
}: Props) {
  const [form, setForm] = React.useState<AppUserRequest>({
    username: "",
    password: "",
    customerId: "",
    roleId: "",
  });

  const [showPassword, setShowPassword] = React.useState(false);

  const customersQ = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: getCustomers,
    enabled: open,
  });

  const rolesQ = useQuery<AppRole[]>({
    queryKey: ["roles"],
    queryFn: () => getRoles(),
    enabled: open,
  });

  React.useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initial) {
      setForm({
        username: initial.username ?? "",
        password: "",
        customerId: initial.customerId ?? "",
        roleId: initial.roleId ?? "",
      });
    } else {
      setForm({ username: "", password: "", customerId: "", roleId: "" });
    }

    setShowPassword(false);
  }, [open, mode, initial]);

  const clearErr = (k: keyof AppUserRequest) => onClearFieldError?.(k);

  const selectedCustomer =
    customersQ.data?.find((c) => c.id === form.customerId) ?? null;

  const selectedRole = rolesQ.data?.find((r) => r.id === form.roleId) ?? null;

  const title = mode === "create" ? "Yeni Kullanıcı" : "Kullanıcı Güncelle";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Kullanıcı Adı"
            value={form.username}
            onChange={(e) => {
              setForm((p) => ({ ...p, username: e.target.value }));
              clearErr("username");
            }}
            error={!!fieldErrors?.username}
            helperText={fieldErrors?.username}
          />

          {/* ✅ Şifre göster/gizle */}
          <TextField
            label="Şifre"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => {
              setForm((p) => ({ ...p, password: e.target.value }));
              clearErr("password");
            }}
            error={!!fieldErrors?.password}
            helperText={
              mode === "edit"
                ? fieldErrors?.password ??
                  "Boş bırakırsan şifre değişmesin (backend böyleyse)"
                : fieldErrors?.password
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Autocomplete
            options={customersQ.data ?? []}
            value={selectedCustomer}
            loading={customersQ.isLoading}
            getOptionLabel={(c) => `${c.name} ${c.surname} (${c.tel})`}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            onChange={(_, val) => {
              setForm((p) => ({ ...p, customerId: val?.id ?? "" }));
              clearErr("customerId");
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Müşteri"
                error={!!fieldErrors?.customerId}
                helperText={fieldErrors?.customerId}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {customersQ.isLoading ? <CircularProgress size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <Autocomplete
            options={rolesQ.data ?? []}
            value={selectedRole}
            loading={rolesQ.isLoading}
            getOptionLabel={(r) => `${r.aciklama} (code: ${r.code})`}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            onChange={(_, val) => {
              setForm((p) => ({ ...p, roleId: val?.id ?? "" }));
              clearErr("roleId");
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Rol"
                error={!!fieldErrors?.roleId}
                helperText={fieldErrors?.roleId}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {rolesQ.isLoading ? <CircularProgress size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          İptal
        </Button>
        <Button
          variant="contained"
          onClick={() => onSubmit(form)}
          disabled={isSubmitting}
        >
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
}
