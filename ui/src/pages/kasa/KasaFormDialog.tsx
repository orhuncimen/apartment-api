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
import type { Kasa, KasaRequest } from "../../api/kasaApi";

type FieldErrors = Partial<Record<keyof KasaRequest, string>>;

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: Kasa | null;
  onClose: () => void;
  onSubmit: (payload: KasaRequest) => void;
  isSubmitting?: boolean;

  fieldErrors?: FieldErrors;
  onClearFieldError?: (field: keyof KasaRequest) => void;
};

export default function KasaFormDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  isSubmitting,
  fieldErrors,
  onClearFieldError,
}: Props) {
  const [form, setForm] = React.useState<KasaRequest>({ years: new Date().getFullYear() });

  React.useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initial) {
      setForm({ years: Number(initial.years) });
    } else {
      setForm({ years: new Date().getFullYear() });
    }
  }, [open, mode, initial]);

  const clearErr = (k: keyof KasaRequest) => onClearFieldError?.(k);

  const title = mode === "create" ? "Yeni Kasa" : "Kasa Güncelle";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Yıl (years)"
            type="number"
            value={form.years}
            onChange={(e) => {
              setForm({ years: Number(e.target.value) });
              clearErr("years");
            }}
            error={!!fieldErrors?.years}
            helperText={fieldErrors?.years}
            inputProps={{ min: 1900, max: 3000 }}
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
