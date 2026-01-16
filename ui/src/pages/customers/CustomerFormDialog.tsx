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
import type { Customer, CustomerRequest } from "../../api/customerApi";

type FieldErrors = Partial<Record<keyof CustomerRequest, string>>;

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: Customer | null;
  onClose: () => void;

  onSubmit: (payload: CustomerRequest) => void;

  // hata map'ini dışarıdan alıp dialog'da göstereceğiz
  fieldErrors?: FieldErrors;
  onClearFieldError?: (field: keyof CustomerRequest) => void;

  isSubmitting?: boolean;
};

export default function CustomerFormDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  fieldErrors,
  onClearFieldError,
  isSubmitting,
}: Props) {
  const [form, setForm] = React.useState<CustomerRequest>({
    name: "",
    surname: "",
    tel: "",
    email: "",
  });

  React.useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initial) {
      setForm({
        name: initial.name ?? "",
        surname: initial.surname ?? "",
        tel: initial.tel ?? "",
        email: initial.email ?? "",
      });
    } else {
      setForm({ name: "", surname: "", tel: "", email: "" });
    }
  }, [open, mode, initial]);

  const handleChange =
    (key: keyof CustomerRequest) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      onClearFieldError?.(key);
    };

  const title = mode === "create" ? "Yeni Müşteri" : "Müşteri Güncelle";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Ad"
            value={form.name}
            onChange={handleChange("name")}
            error={!!fieldErrors?.name}
            helperText={fieldErrors?.name}
          />

          <TextField
            label="Soyad"
            value={form.surname}
            onChange={handleChange("surname")}
            error={!!fieldErrors?.surname}
            helperText={fieldErrors?.surname}
          />

          <TextField
            label="Telefon"
            value={form.tel}
            onChange={handleChange("tel")}
            error={!!fieldErrors?.tel}
            helperText={fieldErrors?.tel}
          />

          <TextField
            label="Email"
            value={form.email}
            onChange={handleChange("email")}
            error={!!fieldErrors?.email}
            helperText={fieldErrors?.email}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          İptal
        </Button>
        <Button variant="contained" onClick={() => onSubmit(form)} disabled={isSubmitting}>
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
}
