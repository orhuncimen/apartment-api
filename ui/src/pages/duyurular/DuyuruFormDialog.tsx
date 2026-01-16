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
import type { Duyuru, DuyuruRequest } from "../../api/duyuruApi";

type FieldErrors = Partial<Record<keyof DuyuruRequest, string>>;

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: Duyuru | null;
  onClose: () => void;
  onSubmit: (payload: DuyuruRequest) => void;
  isSubmitting?: boolean;

  fieldErrors?: FieldErrors;
  onClearFieldError?: (field: keyof DuyuruRequest) => void;
};

function toDatetimeLocalValue(isoOrAny?: string): string {
  if (!isoOrAny) return "";
  const d = new Date(isoOrAny);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function fromDatetimeLocalToIso(value: string): string {
  // "2026-01-14T14:55" -> ISO
  const d = new Date(value);
  return d.toISOString();
}

export default function DuyuruFormDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  isSubmitting,
  fieldErrors,
  onClearFieldError,
}: Props) {
  const [form, setForm] = React.useState<DuyuruRequest>({
    type: "",
    aciklama: "",
    expiredate: "",
  });

  React.useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initial) {
      setForm({
        type: initial.type ?? "",
        aciklama: initial.aciklama ?? "",
        expiredate: initial.expiredate ?? "",
      });
    } else {
      setForm({ type: "", aciklama: "", expiredate: "" });
    }
  }, [open, mode, initial]);

  const clearErr = (k: keyof DuyuruRequest) => onClearFieldError?.(k);

  const title = mode === "create" ? "Yeni Duyuru" : "Duyuru Güncelle";

  const expireLocal = toDatetimeLocalValue(form.expiredate);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Tür (type)"
            value={form.type}
            onChange={(e) => {
              setForm((p) => ({ ...p, type: e.target.value }));
              clearErr("type");
            }}
            error={!!fieldErrors?.type}
            helperText={fieldErrors?.type}
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
            multiline
            minRows={3}
          />

          <TextField
            label="Bitiş Tarihi (expiredate)"
            type="datetime-local"
            value={expireLocal}
            onChange={(e) => {
              const iso = e.target.value ? fromDatetimeLocalToIso(e.target.value) : "";
              setForm((p) => ({ ...p, expiredate: iso }));
              clearErr("expiredate");
            }}
            error={!!fieldErrors?.expiredate}
            helperText={fieldErrors?.expiredate}
            InputLabelProps={{ shrink: true }}
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
