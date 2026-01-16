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
  getUcretTypes,
  createUcretType,
  updateUcretType,
  deleteUcretType,
  type UcretType,
  type UcretTypeRequest,
} from "../../api/ucretTypeApi";
import { getApiErrorMessage } from "../../api/axios";
import UcretTypeFormDialog from "./UcretTypeFormDialog";

type FieldErrors = Partial<Record<keyof UcretTypeRequest, string>>;
type Order = "asc" | "desc";
type SortKey = "code" | "aciklama";

function normalize(s: string) {
  return (s ?? "").toString().trim().toLowerCase();
}
function compare(a: string, b: string) {
  return a.localeCompare(b, "tr", { sensitivity: "base" });
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

  if (m.includes("code")) fe.code = msg;
  if (m.includes("açıklama") || m.includes("aciklama")) fe.aciklama = msg;

  return fe;
}

export default function UcretTypePage() {
  const qc = useQueryClient();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const [selected, setSelected] = React.useState<UcretType | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

  const [search, setSearch] = React.useState("");

  const [orderBy, setOrderBy] = React.useState<SortKey>("code");
  const [order, setOrder] = React.useState<Order>("asc");

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [toast, setToast] = React.useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({ open: false, type: "success", message: "" });

  const q = useQuery<UcretType[]>({
    queryKey: ["ucrettypes"],
    queryFn: getUcretTypes,
  });

  const createMut = useMutation({
    mutationFn: (payload: UcretTypeRequest) => createUcretType(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["ucrettypes"] });
      setToast({ open: true, type: "success", message: "Ücret tipi oluşturuldu" });
      setDialogOpen(false);
      setFieldErrors({});
    },
    onError: (err) => {
      setFieldErrors(extractFieldErrors(err));
      setToast({ open: true, type: "error", message: getApiErrorMessage(err) });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UcretTypeRequest }) =>
      updateUcretType(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["ucrettypes"] });
      setToast({ open: true, type: "success", message: "Ücret tipi güncellendi" });
      setDialogOpen(false);
      setFieldErrors({});
    },
    onError: (err) => {
      setFieldErrors(extractFieldErrors(err));
      setToast({ open: true, type: "error", message: getApiErrorMessage(err) });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteUcretType(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["ucrettypes"] });
      setToast({ open: true, type: "success", message: "Ücret tipi silindi" });
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

  const openEdit = (t: UcretType) => {
    setMode("edit");
    setSelected(t);
    setFieldErrors({});
    setDialogOpen(true);
  };

  const onSubmit = (payload: UcretTypeRequest) => {
    if (mode === "create") {
      createMut.mutate(payload);
      return;
    }
    if (!selected) return;
    updateMut.mutate({ id: selected.id, payload });
  };

  const onDelete = (t: UcretType) => {
    const ok = window.confirm(`"${t.aciklama}" (code: ${t.code}) silinsin mi?`);
    if (!ok) return;
    deleteMut.mutate(t.id);
  };

  const clearFieldError = (field: keyof UcretTypeRequest) => {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleSort = (key: SortKey) => {
    if (orderBy === key) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
      return;
    }
    setOrderBy(key);
    setOrder("asc");
  };

  const filteredSorted = React.useMemo(() => {
    const list = q.data ?? [];
    const s = normalize(search);

    const filtered = !s
      ? list
      : list.filter((x) => {
          const hay = [x.code, x.aciklama].map(normalize).join(" ");
          return hay.includes(s);
        });

    const sorted = [...filtered].sort((a, b) => {
      const av = orderBy === "code" ? a.code : a.aciklama;
      const bv = orderBy === "code" ? b.code : b.aciklama;
      const c = compare(normalize(av), normalize(bv));
      return order === "asc" ? c : -c;
    });

    return sorted;
  }, [q.data, search, orderBy, order]);

  React.useEffect(() => setPage(0), [search, orderBy, order]);

  const paged = React.useMemo(() => {
    const start = page * rowsPerPage;
    return filteredSorted.slice(start, start + rowsPerPage);
  }, [filteredSorted, page, rowsPerPage]);

  if (q.isLoading) return <CircularProgress />;
  if (q.error) return <div>Hata oluştu</div>;

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Ücret Tipleri</Typography>
        <Button variant="contained" onClick={openCreate}>
          Yeni Ücret Tipi
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ara: code / açıklama"
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
                  active={orderBy === "code"}
                  direction={orderBy === "code" ? order : "asc"}
                  onClick={() => toggleSort("code")}
                >
                  Code
                </TableSortLabel>
              </TableCell>

              <TableCell>
                <TableSortLabel
                  active={orderBy === "aciklama"}
                  direction={orderBy === "aciklama" ? order : "asc"}
                  onClick={() => toggleSort("aciklama")}
                >
                  Açıklama
                </TableSortLabel>
              </TableCell>

              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paged.map((t) => (
              <TableRow key={t.id} hover>
                <TableCell sx={{ fontFamily: "monospace" }}>{t.code}</TableCell>
                <TableCell>{t.aciklama}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => openEdit(t)} aria-label="edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => onDelete(t)} aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {filteredSorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={3}>Kayıt yok</TableCell>
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

      <UcretTypeFormDialog
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
        <Alert severity={toast.type} onClose={() => setToast((t) => ({ ...t, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
