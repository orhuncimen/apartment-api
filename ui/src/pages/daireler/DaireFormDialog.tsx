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
import type { Daire, DaireRequest } from "../../api/daireApi";
import type { AppUser } from "../../api/userApi";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: Daire | null;
  users: AppUser[];
  onClose: () => void;
  onSubmit: (payload: DaireRequest) => void;
  isSubmitting?: boolean;
};

function getUsername(u: AppUser): string {
  return ((u as any).app_user ?? (u as any).username ?? "").toString();
}
function getUserId(u: AppUser): string {
  return (u as any).id?.toString() ?? "";
}

export default function DaireFormDialog({
  open,
  mode,
  initial,
  users,
  onClose,
  onSubmit,
  isSubmitting,
}: Props) {
  const [form, setForm] = React.useState<DaireRequest>({ userid: "", daireno: "" });

  React.useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initial) {
      setForm({
        userid: initial.userid ?? "",
        daireno: initial.daireno ?? "",
      });
    } else {
      setForm({ userid: "", daireno: "" });
    }
  }, [open, mode, initial]);

  const title = mode === "create" ? "Yeni Daire" : "Daire Güncelle";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            select
            label="Kullanıcı (user)"
            value={form.userid}
            onChange={(e) => setForm((p) => ({ ...p, userid: e.target.value }))}
            helperText="Daireyi hangi kullanıcıya bağlayacağız?"
          >
            {users.map((u) => (
              <MenuItem key={getUserId(u)} value={getUserId(u)}>
                {getUsername(u) || getUserId(u)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Daire No"
            value={form.daireno}
            onChange={(e) => setForm((p) => ({ ...p, daireno: e.target.value }))}
            helperText="Örn: 6"
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
