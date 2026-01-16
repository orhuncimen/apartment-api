import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from "@mui/material";
import type { KasaDirection, KasaHareketRequest } from "../../api/kasaHareketApi";
import type { Daire } from "../../api/daireApi";
import type { UcretType } from "../../api/ucretTypeApi";

type FieldErrors = Partial<Record<keyof KasaHareketRequest, string>>;

type Props = {
  open: boolean;
  kasaid: string;
  onClose: () => void;
  onSubmit: (payload: KasaHareketRequest) => void;
  isSubmitting?: boolean;

  daireler?: Daire[];
  ucretTypes?: UcretType[];

  fieldErrors?: FieldErrors;
  onClearFieldError?: (field: keyof KasaHareketRequest) => void;
};

export default function KasaHareketFormDialog({
  open,
  kasaid,
  onClose,
  onSubmit,
  isSubmitting,
  daireler,
  ucretTypes,
  fieldErrors,
  onClearFieldError,
}: Props) {
  const [form, setForm] = React.useState<KasaHareketRequest>({
    kasaid,
    daireid: null,
    ucrettypeid: null,
    amount: 0,
    direction: "IN",
    description: "",
  });

  React.useEffect(() => {
    if (!open) return;
    setForm({
      kasaid,
      daireid: null,
      ucrettypeid: null,
      amount: 0,
      direction: "IN",
      description: "",
    });
  }, [open, kasaid]);

  const clearErr = (k: keyof KasaHareketRequest) => onClearFieldError?.(k);

  const handleSubmit = () => {
    onSubmit({
      ...form,
      kasaid,
      amount: Number(form.amount),
      description: form.description?.trim() ? form.description : null,
      daireid: form.daireid ? form.daireid : null,
      ucrettypeid: form.ucrettypeid ? form.ucrettypeid : null,
    });
  };

  const dirOptions: { value: KasaDirection; label: string }[] = [
    { value: "IN", label: "IN (Giriş)" },
    { value: "OUT", label: "OUT (Çıkış)" },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Yeni Kasa Hareketi</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <FormControl error={!!fieldErrors?.direction}>
            <InputLabel>Direction</InputLabel>
            <Select
              label="Direction"
              value={form.direction}
              onChange={(e) => {
                setForm((p) => ({ ...p, direction: e.target.value as KasaDirection }));
                clearErr("direction");
              }}
            >
              {dirOptions.map((x) => (
                <MenuItem key={x.value} value={x.value}>
                  {x.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{fieldErrors?.direction}</FormHelperText>
          </FormControl>

          <TextField
            label="Amount"
            type="number"
            value={form.amount}
            onChange={(e) => {
              setForm((p) => ({ ...p, amount: Number(e.target.value) }));
              clearErr("amount");
            }}
            error={!!fieldErrors?.amount}
            helperText={fieldErrors?.amount}
            inputProps={{ step: "0.01" }}
          />

          <FormControl error={!!fieldErrors?.daireid}>
            <InputLabel>Daire (opsiyonel)</InputLabel>
            <Select
              label="Daire (opsiyonel)"
              value={form.daireid ?? ""}
              onChange={(e) => {
                setForm((p) => ({ ...p, daireid: String(e.target.value) || null }));
                clearErr("daireid");
              }}
            >
              <MenuItem value="">(Seçilmedi)</MenuItem>
              {(daireler ?? []).map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  Daire {d.daireno} ({d.id.slice(0, 8)}…)
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{fieldErrors?.daireid}</FormHelperText>
          </FormControl>

          <FormControl error={!!fieldErrors?.ucrettypeid}>
            <InputLabel>Ücret Tipi (opsiyonel)</InputLabel>
            <Select
              label="Ücret Tipi (opsiyonel)"
              value={form.ucrettypeid ?? ""}
              onChange={(e) => {
                setForm((p) => ({ ...p, ucrettypeid: String(e.target.value) || null }));
                clearErr("ucrettypeid");
              }}
            >
              <MenuItem value="">(Seçilmedi)</MenuItem>
              {(ucretTypes ?? []).map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.aciklama} (code: {u.code})
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{fieldErrors?.ucrettypeid}</FormHelperText>
          </FormControl>

          <TextField
            label="Description (opsiyonel)"
            value={form.description ?? ""}
            onChange={(e) => {
              setForm((p) => ({ ...p, description: e.target.value }));
              clearErr("description");
            }}
            error={!!fieldErrors?.description}
            helperText={fieldErrors?.description}
            multiline
            minRows={2}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          İptal
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
}
