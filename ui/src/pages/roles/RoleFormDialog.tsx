import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from "@mui/material";
import type { AppRole, AppRoleRequest } from "../../api/roleApi";

type FieldErrors = Partial<Record<keyof AppRoleRequest, string>>;

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: AppRole | null;
  onClose: () => void;
  onSubmit: (payload: AppRoleRequest) => void;
  isSubmitting?: boolean;

  // opsiyonel (Customer’daki gibi)
  fieldErrors?: FieldErrors;
  onClearFieldError?: (field: keyof AppRoleRequest) => void;
};

export default function RoleFormDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  isSubmitting,
  fieldErrors,
  onClearFieldError,
}: Props) {
  const [form, setForm] = React.useState<AppRoleRequest>({
    code: "",
    aciklama: "",
  });

  React.useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initial) {
      setForm({
        code: initial.code ?? "",
        aciklama: initial.aciklama ?? "",
      });
    } else {
      setForm({ code: "", aciklama: "" });
    }
  }, [open, mode, initial]);

  const clearErr = (k: keyof AppRoleRequest) => onClearFieldError?.(k);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === "create" ? "Yeni Rol" : "Rol Güncelle"}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Code"
            value={form.code}
            onChange={(e) => {
              setForm((p) => ({ ...p, code: e.target.value }));
              clearErr("code");
            }}
            error={!!fieldErrors?.code}
            helperText={fieldErrors?.code}
          />

          <TextField
            label="Açıklama"
            value={form.aciklama}
            onChange={(e) => {
              setForm((p) => ({ ...p, aciklama: e.target.value }));
              clearErr("aciklama");
            }}
            error={!!fieldErrors?.aciklama}
            helperText={fieldErrors?.aciklama}
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
