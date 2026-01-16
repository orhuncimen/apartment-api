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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "../../api/axios";
import {
  getDuyurular,
  getActiveDuyurular,
  createDuyuru,
  updateDuyuru,
  deleteDuyuru,
  type Duyuru,
  type DuyuruRequest,
} from "../../api/duyuruApi";
import DuyuruFormDialog from "./DuyuruFormDialog";

type FieldErrors = Partial<Record<keyof DuyuruRequest, string>>;
type Order = "asc" | "desc";
type SortKey = "type" | "expiredate";

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

  return fe;
}

export default function DuyuruPage() {
  const qc = useQueryClient();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const [selected, setSelected] = React.useState<Duyuru | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

  const [onlyActive, setOnlyActive] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const [orderBy, setOrderBy] = React.useState<SortKey>("expiredate");
  const [order, setOrder] = React.useState<Order>("desc");

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [toast, setToast] = React.useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({ open: false, type: "success", message: "" });

  const duyuruQ = useQuery<Duyuru[]>({
    queryKey: ["duyurular", { onlyActive }],
    queryFn: () => (onlyActive ? getActiveDuyurular() : getDuyurular()),
  });

  const createMut = useMutation({
    mutationFn: (payload: DuyuruRequest) => createDuyuru(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["duyurular"] });
      setToast({ open: true, type: "success", message: "Duyuru oluşturuldu" });
      setDialogOpen(false);
      setFieldErrors({});
    },
    onError: (err) => {
      setFieldErrors(extractFieldErrors(err));
      setToast({ open: true, type: "error", message: getApiErrorMessage(err) });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DuyuruRequest }) =>
      updateDuyuru(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["duyurular"] });
      setToast({ open: true, type: "success", message: "Duyuru güncellendi" });
      setDialogOpen(false);
      setFieldErrors({});
    },
    onError: (err) => {
      setFieldErrors(extractFieldErrors(err));
      setToast({ open: true, type: "error", message: getApiErrorMessage(err) });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteDuyuru(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["duyurular"] });
      setToast({ open: true, type: "success", message: "Duyuru silindi" });
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

  const openEdit = (d: Duyuru) => {
    setMode("edit");
    setSelected(d);
    setFieldErrors({});
    setDialogOpen(true);
  };

  const onSubmit = (payload: DuyuruRequest) => {
    if (mode === "create") {
      createMut.mutate(payload);
      return;
    }
    if (!selected) return;
    updateMut.mutate({ id: selected.id, payload });
  };

  const onDelete = (d: Duyuru) => {
    const ok = window.confirm(`"${d.type}" duyurusu silinsin mi?`);
    if (!ok) return;
    deleteMut.mutate(d.id);
  };

  const clearFieldError = (field: keyof DuyuruRequest) => {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleSort = (key: SortKey) => {
    if (orderBy === key) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
      return;
    }
    setOrderBy(key);
    setOrder(key === "expiredate" ? "desc" : "asc");
  };

  const filteredSorted = React.useMemo(() => {
    const list = duyuruQ.data ?? [];
    const q = normalize(search);

    const filtered = !q
      ? list
      : list.filter((d) => {
          const hay = [d.type, d.aciklama, d.expiredate].map(normalize).join(" ");
          return hay.includes(q);
        });

    const sorted = [...filtered].sort((a, b) => {
      if (orderBy === "type") {
        const c = compare(normalize(a.type), normalize(b.type));
        return order === "asc" ? c : -c;
      }

      // expiredate
      const at = new Date(a.expiredate ?? "").getTime();
      const bt = new Date(b.expiredate ?? "").getTime();
      const av = Number.isNaN(at) ? 0 : at;
      const bv = Number.isNaN(bt) ? 0 : bt;
      const c = av === bv ? 0 : av < bv ? -1 : 1;
      return order === "asc" ? c : -c;
    });

    return sorted;
  }, [duyuruQ.data, search, orderBy, order]);

  React.useEffect(() => {
    setPage(0);
  }, [search, onlyActive, orderBy, order]);

  const paged = React.useMemo(() => {
    const start = page * rowsPerPage;
    return filteredSorted.slice(start, start + rowsPerPage);
  }, [filteredSorted, page, rowsPerPage]);

  if (duyuruQ.isLoading) return <CircularProgress />;
  if (duyuruQ.error) return <div>Hata oluştu</div>;

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Duyurular</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Yeni Duyuru
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ara: type / açıklama / expiredate"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControlLabel
            control={
              <Switch checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
            }
            label="Sadece aktif"
          />
        </Stack>

        <Stack direction="row" spacing={2} mt={1} alignItems="center" flexWrap="wrap">
          <Chip
            size="small"
            label={`Gösterilen: ${filteredSorted.length} / Toplam: ${duyuruQ.data?.length ?? 0}`}
            variant="outlined"
          />
        </Stack>
      </Paper>

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
            {paged.map((d) => (
              <TableRow key={d.id} hover>
                <TableCell>{d.type}</TableCell>
                <TableCell sx={{ maxWidth: 600, whiteSpace: "pre-wrap" }}>
                  {d.aciklama}
                </TableCell>
                <TableCell sx={{ fontFamily: "monospace" }}>{formatDate(d.expiredate)}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => openEdit(d)} aria-label="edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => onDelete(d)} aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {filteredSorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>Kayıt yok</TableCell>
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

      <DuyuruFormDialog
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
