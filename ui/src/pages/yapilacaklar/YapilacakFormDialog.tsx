import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  MenuItem,
} from "@mui/material";
import type { Yapilacak, YapilacakRequest } from "../../api/yapilacakApi";

type FieldErrors = Partial<Record<keyof YapilacakRequest, string>>;

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: Yapilacak | null;
  onClose: () => void;
  onSubmit: (payload: YapilacakRequest) => void;
  isSubmitting?: boolean;

  fieldErrors?: FieldErrors;
  onClearFieldError?: (field: keyof YapilacakRequest) => void;
};

const STATUSES = ["beklemede", "devam ediyor", "tamamlandı", "planlandı", "iptal"];

function toDatetimeLocalValue(isoOrAny?: string): string {
  if (!isoOrAny) return "";
  const d = new Date(isoOrAny);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalToIso(value: string): string {
  const d = new Date(value);
  return d.toISOString();
}

export default function YapilacakFormDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  isSubmitting,
  fieldErrors,
  onClearFieldError,
}: Props) {
  const [form, setForm] = React.useState<YapilacakRequest>({
    type: "",
    aciklama: "",
    expiredate: "",
    status: "beklemede",
  });

  React.useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initial) {
      setForm({
        type: initial.type ?? "",
        aciklama: initial.aciklama ?? "",
        expiredate: initial.expiredate ?? "",
        status: initial.status ?? "beklemede",
      });
    } else {
      setForm({ type: "", aciklama: "", expiredate: "", status: "beklemede" });
    }
  }, [open, mode, initial]);

  const clearErr = (k: keyof YapilacakRequest) => onClearFieldError?.(k);

  const title = mode === "create" ? "Yeni Yapılacak" : "Yapılacak Güncelle";
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

          <TextField
            label="Durum (status)"
            select
            value={form.status}
            onChange={(e) => {
              setForm((p) => ({ ...p, status: e.target.value }));
              clearErr("status");
            }}
            error={!!fieldErrors?.status}
            helperText={fieldErrors?.status}
          >
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
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
