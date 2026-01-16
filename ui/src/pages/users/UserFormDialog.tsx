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
    app_user: "",
    app_password: "",
    customerid: "",
    roleid: "",
  });

  const [showPassword, setShowPassword] = React.useState(false);

  const customersQ = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: getCustomers,
    enabled: open,
  });

  const rolesQ = useQuery<AppRole[]>({
    queryKey: ["roles"],
    queryFn: getRoles,
    enabled: open,
  });

  React.useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initial) {
      setForm({
        app_user: initial.app_user ?? "",
        app_password: "", // editte boş bırakılırsa gönderilmeyecek (UserPage’de iyileştirme)
        customerid: initial.customerid ?? "",
        roleid: initial.roleid ?? "",
      });
    } else {
      setForm({ app_user: "", app_password: "", customerid: "", roleid: "" });
    }

    setShowPassword(false);
  }, [open, mode, initial]);

  const clearErr = (k: keyof AppUserRequest) => onClearFieldError?.(k);

  const selectedCustomer =
    customersQ.data?.find((c) => c.id === form.customerid) ?? null;

  const selectedRole = rolesQ.data?.find((r) => r.id === form.roleid) ?? null;

  const title = mode === "create" ? "Yeni Kullanıcı" : "Kullanıcı Güncelle";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Kullanıcı Adı"
            value={form.app_user}
            onChange={(e) => {
              setForm((p) => ({ ...p, app_user: e.target.value }));
              clearErr("app_user");
            }}
            error={!!fieldErrors?.app_user}
            helperText={fieldErrors?.app_user}
          />

          <TextField
            label="Şifre"
            type={showPassword ? "text" : "password"}
            value={form.app_password ?? ""}
            onChange={(e) => {
              setForm((p) => ({ ...p, app_password: e.target.value }));
              clearErr("app_password");
            }}
            error={!!fieldErrors?.app_password}
            helperText={
              mode === "edit"
                ? fieldErrors?.app_password ?? "Boş bırakırsan şifre değişmez (gönderilmeyecek)."
                : fieldErrors?.app_password
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
              setForm((p) => ({ ...p, customerid: val?.id ?? "" }));
              clearErr("customerid");
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Müşteri"
                error={!!fieldErrors?.customerid}
                helperText={fieldErrors?.customerid}
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
              setForm((p) => ({ ...p, roleid: val?.id ?? "" }));
              clearErr("roleid");
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Rol"
                error={!!fieldErrors?.roleid}
                helperText={fieldErrors?.roleid}
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
