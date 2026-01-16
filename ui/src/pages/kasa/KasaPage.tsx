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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getKasalar,
  createKasa,
  updateKasa,
  deleteKasa,
  type Kasa,
  type KasaRequest,
} from "../../api/kasaApi";
import { getApiErrorMessage } from "../../api/axios";
import KasaFormDialog from "./KasaFormDialog";

type FieldErrors = Partial<Record<keyof KasaRequest, string>>;
type Order = "asc" | "desc";
type SortKey = "years";

function normalize(s: string) {
  return (s ?? "").toString().trim().toLowerCase();
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
  if (m.includes("year") || m.includes("years") || m.includes("yıl")) fe.years = msg;
  return fe;
}

export default function KasaPage() {
  const qc = useQueryClient();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const [selected, setSelected] = React.useState<Kasa | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

  const [search, setSearch] = React.useState("");

  const [orderBy, setOrderBy] = React.useState<SortKey>("years");
  const [order, setOrder] = React.useState<Order>("asc");

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [toast, setToast] = React.useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({ open: false, type: "success", message: "" });

  const q = useQuery<Kasa[]>({
    queryKey: ["kasa"],
    queryFn: getKasalar,
  });

  const createMut = useMutation({
    mutationFn: (payload: KasaRequest) => createKasa(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["kasa"] });
      setToast({ open: true, type: "success", message: "Kasa oluşturuldu" });
      setDialogOpen(false);
      setFieldErrors({});
    },
    onError: (err) => {
      setFieldErrors(extractFieldErrors(err));
      setToast({ open: true, type: "error", message: getApiErrorMessage(err) });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: KasaRequest }) =>
      updateKasa(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["kasa"] });
      setToast({ open: true, type: "success", message: "Kasa güncellendi" });
      setDialogOpen(false);
      setFieldErrors({});
    },
    onError: (err) => {
      setFieldErrors(extractFieldErrors(err));
      setToast({ open: true, type: "error", message: getApiErrorMessage(err) });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteKasa(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["kasa"] });
      setToast({ open: true, type: "success", message: "Kasa silindi" });
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

  const openEdit = (k: Kasa) => {
    setMode("edit");
    setSelected(k);
    setFieldErrors({});
    setDialogOpen(true);
  };

  const onSubmit = (payload: KasaRequest) => {
    if (mode === "create") {
      createMut.mutate(payload);
      return;
    }
    if (!selected) return;
    updateMut.mutate({ id: selected.id, payload });
  };

  const onDelete = (k: Kasa) => {
    const ok = window.confirm(`"${k.years}" yılı kasası silinsin mi?`);
    if (!ok) return;
    deleteMut.mutate(k.id);
  };

  const clearFieldError = (field: keyof KasaRequest) => {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleSort = () => {
    setOrder((o) => (o === "asc" ? "desc" : "asc"));
  };

  const filteredSorted = React.useMemo(() => {
    const list = q.data ?? [];
    const s = normalize(search);

    const filtered = !s
      ? list
      : list.filter((x) => normalize(String(x.years)).includes(s));

    const sorted = [...filtered].sort((a, b) => {
      const av = Number(a.years);
      const bv = Number(b.years);
      const c = av - bv;
      return order === "asc" ? c : -c;
    });

    return sorted;
  }, [q.data, search, order]);

  React.useEffect(() => setPage(0), [search, order, orderBy]);

  const paged = React.useMemo(() => {
    const start = page * rowsPerPage;
    return filteredSorted.slice(start, start + rowsPerPage);
  }, [filteredSorted, page, rowsPerPage]);

  if (q.isLoading) return <CircularProgress />;
  if (q.error) return <div>Hata oluştu</div>;

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Kasa</Typography>
        <Button variant="contained" onClick={openCreate}>
          Yeni Kasa
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ara: yıl (2025, 2026...)"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.75 }}>
          Gösterilen: {filteredSorted.length} / Toplam: {q.data?.length ?? 0}
        </Typography>
      </Paper>

      <Paper variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "years"}
                  direction={order}
                  onClick={toggleSort}
                >
                  Yıl
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paged.map((k) => (
              <TableRow key={k.id} hover>
                <TableCell sx={{ fontFamily: "monospace" }}>{k.years}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => openEdit(k)} aria-label="edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => onDelete(k)} aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {filteredSorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={2}>Kayıt yok</TableCell>
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

      <KasaFormDialog
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
        autoHideDuration={2500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      >
        <Alert
          severity={toast.type}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
