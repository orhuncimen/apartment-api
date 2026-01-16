import * as React from "react";
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Stack,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  TablePagination,
  TableSortLabel,
  FormControlLabel,
  Switch,
  Chip,
  MenuItem,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "../../api/axios";
import {
  getYapilacaklar,
  getNotExpiredYapilacaklar,
  getYapilacaklarByStatus,
  getStatusCount,
  getActiveStatusCount,
  createYapilacak,
  updateYapilacak,
  deleteYapilacak,
  type Yapilacak,
  type YapilacakRequest,
} from "../../api/yapilacakApi";
import YapilacakFormDialog from "./YapilacakFormDialog";

type FieldErrors = Partial<Record<keyof YapilacakRequest, string>>;
type Order = "asc" | "desc";
type SortKey = "type" | "status" | "expiredate";

const STATUSES = ["", "beklemede", "devam ediyor", "tamamlandı", "planlandı", "iptal"];

function normalize(s: string) {
  return (s ?? "").toString().trim().toLowerCase();
}

function compare(a: string, b: string) {
  return a.localeCompare(b, "tr", { sensitivity: "base" });
}

function formatDate(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("tr-TR");
}

function statusChipColor(status?: string):
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error" {
  const s = normalize(status);
  if (s.includes("tamam")) return "success";
  if (s.includes("devam")) return "info";
  if (s.includes("plan")) return "primary";
  if (s.includes("bekle")) return "warning";
  if (s.includes("iptal")) return "error";
  return "default";
}

function isExpired(expiredate?: string) {
  if (!expiredate) return false;
  const t = new Date(expiredate).getTime();
  if (Number.isNaN(t)) return false;
  return t < Date.now();
}

function extractFieldErrors(err: unknown): FieldErrors {
  if (!axios.isAxiosError(err)) return {};
  const data: any = err.response?.data;

  if (data?.errors && typeof data.errors === "object" && !Array.isArray(data.errors)) {
    return data.errors as FieldErrors;
  }

  const msg = data?.message ? String(data.message) : "";
  const m = msg.toLowerCase();
  const fe: FieldErrors = {};

  if (m.includes("type")) fe.type = msg;
  if (m.includes("aciklama") || m.includes("açıklama")) fe.aciklama = msg;
  if (m.includes("expire")) fe.expiredate = msg;
  if (m.includes("status")) fe.status = msg;

  return fe;
}

export default function YapilacakPage() {
  const qc = useQueryClient();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const [selected, setSelected] = React.useState<Yapilacak | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

  const [onlyNotExpired, setOnlyNotExpired] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [search, setSearch] = React.useState("");

  const [orderBy, setOrderBy] = React.useState<SortKey>("expiredate");
  const [order, setOrder] = React.useState<Order>("asc");

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [toast, setToast] = React.useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({ open: false, type: "success", message: "" });

  // Liste kaynağı:
  // - onlyNotExpired => /not-expired
  // - statusFilter dolu => /status/{status}
  // - aksi => /yapilacaklar
  const listQ = useQuery<Yapilacak[]>({
    queryKey: ["yapilacaklar", { onlyNotExpired, statusFilter }],
    queryFn: () => {
      if (onlyNotExpired) return getNotExpiredYapilacaklar();
      if (statusFilter) return getYapilacaklarByStatus(statusFilter);
      return getYapilacaklar();
    },
  });

  const statusCountQ = useQuery({
    queryKey: ["yapilacaklar-status-count"],
    queryFn: getStatusCount,
  });

  const activeStatusCountQ = useQuery({
    queryKey: ["yapilacaklar-status-count-active"],
    queryFn: getActiveStatusCount,
  });

  const createMut = useMutation({
    mutationFn: (payload: YapilacakRequest) => createYapilacak(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["yapilacaklar"] });
      await qc.invalidateQueries({ queryKey: ["yapilacaklar-status-count"] });
      await qc.invalidateQueries({ queryKey: ["yapilacaklar-status-count-active"] });
      setToast({ open: true, type: "success", message: "Yapılacak oluşturuldu" });
      setDialogOpen(false);
      setFieldErrors({});
    },
    onError: (err) => {
      setFieldErrors(extractFieldErrors(err));
      setToast({ open: true, type: "error", message: getApiErrorMessage(err) });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: YapilacakRequest }) =>
      updateYapilacak(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["yapilacaklar"] });
      await qc.invalidateQueries({ queryKey: ["yapilacaklar-status-count"] });
      await qc.invalidateQueries({ queryKey: ["yapilacaklar-status-count-active"] });
      setToast({ open: true, type: "success", message: "Yapılacak güncellendi" });
      setDialogOpen(false);
      setFieldErrors({});
    },
    onError: (err) => {
      setFieldErrors(extractFieldErrors(err));
      setToast({ open: true, type: "error", message: getApiErrorMessage(err) });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteYapilacak(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["yapilacaklar"] });
      await qc.invalidateQueries({ queryKey: ["yapilacaklar-status-count"] });
      await qc.invalidateQueries({ queryKey: ["yapilacaklar-status-count-active"] });
      setToast({ open: true, type: "success", message: "Yapılacak silindi" });
    },
    onError: (err) => {
      setToast({ open: true, type: "error", message: getApiErrorMessage(err) });
    },
  });

  const openCreate = () => {
    setMode("create");
    setSelected(null);
    setFieldErrors({});
    setDialogOpen(true);
  };

  const openEdit = (y: Yapilacak) => {
    setMode("edit");
    setSelected(y);
    setFieldErrors({});
    setDialogOpen(true);
  };

  const onSubmit = (payload: YapilacakRequest) => {
    if (mode === "create") {
      createMut.mutate(payload);
      return;
    }
    if (!selected) return;
    updateMut.mutate({ id: selected.id, payload });
  };

  const onDelete = (y: Yapilacak) => {
    const ok = window.confirm(`"${y.type}" silinsin mi?`);
    if (!ok) return;
    deleteMut.mutate(y.id);
  };

  const clearFieldError = (field: keyof YapilacakRequest) => {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleSort = (key: SortKey) => {
    if (orderBy === key) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
      return;
    }
    setOrderBy(key);
    setOrder(key === "expiredate" ? "asc" : "asc");
  };

  const filteredSorted = React.useMemo(() => {
    const list = listQ.data ?? [];
    const q = normalize(search);

    const filtered = !q
      ? list
      : list.filter((x) => {
          const hay = [x.type, x.aciklama, x.status, x.expiredate].map(normalize).join(" ");
          return hay.includes(q);
        });

    const sorted = [...filtered].sort((a, b) => {
      if (orderBy === "expiredate") {
        const at = new Date(a.expiredate ?? "").getTime();
        const bt = new Date(b.expiredate ?? "").getTime();
        const av = Number.isNaN(at) ? 0 : at;
        const bv = Number.isNaN(bt) ? 0 : bt;
        const c = av === bv ? 0 : av < bv ? -1 : 1;
        return order === "asc" ? c : -c;
      }

      const av = normalize((a as any)[orderBy] ?? "");
      const bv = normalize((b as any)[orderBy] ?? "");
      const c = compare(av, bv);
      return order === "asc" ? c : -c;
    });

    return sorted;
  }, [listQ.data, search, orderBy, order]);

  React.useEffect(() => {
    setPage(0);
  }, [search, onlyNotExpired, statusFilter, orderBy, order]);

  const paged = React.useMemo(() => {
    const start = page * rowsPerPage;
    return filteredSorted.slice(start, start + rowsPerPage);
  }, [filteredSorted, page, rowsPerPage]);

  if (listQ.isLoading) return <CircularProgress />;
  if (listQ.error) return <div>Hata oluştu</div>;

  const total = listQ.data?.length ?? 0;
  const shown = filteredSorted.length;

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Yapılacaklar</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Yeni Yapılacak
        </Button>
      </Stack>

      {/* COUNT CARDS */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" mb={1}>
          Status Count
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap">
          {Object.entries(statusCountQ.data ?? {}).map(([k, v]) => (
            <Chip key={k} label={`${k}: ${v}`} variant="outlined" />
          ))}
          {(Object.keys(statusCountQ.data ?? {}).length === 0) && (
            <Chip label="(status-count boş)" variant="outlined" />
          )}
        </Stack>

        <Divider sx={{ my: 2 }} />

       <Typography variant="subtitle1" mb={1}>
         Aktif Status Count (deleted=false + expiredate{">="}now)
       </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap">
          {Object.entries(activeStatusCountQ.data ?? {}).map(([k, v]) => (
            <Chip key={k} label={`${k}: ${v}`} color="info" variant="outlined" />
          ))}
          {(Object.keys(activeStatusCountQ.data ?? {}).length === 0) && (
            <Chip label="(active status-count boş)" variant="outlined" />
          )}
        </Stack>
      </Paper>

      {/* FILTER BAR */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ara: type / açıklama / status / expiredate"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Status"
            select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
            disabled={onlyNotExpired}
            helperText={onlyNotExpired ? "not-expired açıkken status filter devre dışı" : " "}
          >
            {STATUSES.map((s) => (
              <MenuItem key={s || "all"} value={s}>
                {s ? s : "Tümü"}
              </MenuItem>
            ))}
          </TextField>

          <FormControlLabel
            control={
              <Switch
                checked={onlyNotExpired}
                onChange={(e) => {
                  setOnlyNotExpired(e.target.checked);
                  if (e.target.checked) setStatusFilter("");
                }}
              />
            }
            label="Sadece not-expired"
          />

          <Button
            variant="outlined"
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setOnlyNotExpired(false);
            }}
          >
            Temizle
          </Button>
        </Stack>

        <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" alignItems="center">
          <Chip size="small" label={`Gösterilen: ${shown} / Toplam: ${total}`} variant="outlined" />
        </Stack>
      </Paper>

      {/* TABLE */}
      <Paper variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "type"}
                  direction={orderBy === "type" ? order : "asc"}
                  onClick={() => toggleSort("type")}
                >
                  Tür
                </TableSortLabel>
              </TableCell>

              <TableCell>Açıklama</TableCell>

              <TableCell>
                <TableSortLabel
                  active={orderBy === "status"}
                  direction={orderBy === "status" ? order : "asc"}
                  onClick={() => toggleSort("status")}
                >
                  Durum
                </TableSortLabel>
              </TableCell>

              <TableCell>
                <TableSortLabel
                  active={orderBy === "expiredate"}
                  direction={orderBy === "expiredate" ? order : "asc"}
                  onClick={() => toggleSort("expiredate")}
                >
                  Bitiş Tarihi
                </TableSortLabel>
              </TableCell>

              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paged.map((y) => {
              const expired = isExpired(y.expiredate);
              return (
                <TableRow key={y.id} hover sx={expired ? { opacity: 0.6 } : undefined}>
                  <TableCell>{y.type}</TableCell>
                  <TableCell sx={{ maxWidth: 600, whiteSpace: "pre-wrap" }}>
                    {y.aciklama}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={y.status}
                      color={statusChipColor(y.status)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ fontFamily: "monospace" }}>{formatDate(y.expiredate)}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => openEdit(y)} aria-label="edit">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => onDelete(y)} aria-label="delete">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}

            {filteredSorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>Kayıt yok</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filteredSorted.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      <YapilacakFormDialog
        open={dialogOpen}
        mode={mode}
        initial={selected}
        onClose={() => {
          setDialogOpen(false);
          setFieldErrors({});
        }}
        onSubmit={onSubmit}
        isSubmitting={createMut.isPending || updateMut.isPending}
        fieldErrors={fieldErrors}
        onClearFieldError={clearFieldError}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      >
        <Alert severity={toast.type} onClose={() => setToast((t) => ({ ...t, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
