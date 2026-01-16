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
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  type AppRole,
  type AppRoleRequest,
} from "../../api/roleApi";
import RoleFormDialog from "./RoleFormDialog";
import { getApiErrorMessage } from "../../api/axios";

type FieldErrors = Partial<Record<keyof AppRoleRequest, string>>;
type Order = "asc" | "desc";
type SortKey = "code" | "aciklama";

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
  const fe: FieldErrors = {};
  if (msg.toLowerCase().includes("code")) fe.code = msg;
  if (msg.toLowerCase().includes("açıklama") || msg.toLowerCase().includes("aciklama"))
    fe.aciklama = msg;
  return fe;
}

function compare(a: string, b: string) {
  return a.localeCompare(b, "tr", { sensitivity: "base" });
}

export default function RolePage() {
  const qc = useQueryClient();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const [selected, setSelected] = React.useState<AppRole | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

  const [search, setSearch] = React.useState("");

  // sort
  const [orderBy, setOrderBy] = React.useState<SortKey>("code");
  const [order, setOrder] = React.useState<Order>("asc");

  // pagination
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const [toast, setToast] = React.useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({ open: false, type: "success", message: "" });

  const { data, isLoading, error } = useQuery<AppRole[]>({
    queryKey: ["roles"],
    queryFn: getRoles,
  });

  const createMut = useMutation({
    mutationFn: (payload: AppRoleRequest) => createRole(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["roles"] });
      setToast({ open: true, type: "success", message: "Rol oluşturuldu" });
      setDialogOpen(false);
      setFieldErrors({});
    },
    onError: (err) => {
      setFieldErrors(extractFieldErrors(err));
      setToast({ open: true, type: "error", message: getApiErrorMessage(err) });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AppRoleRequest }) =>
      updateRole(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["roles"] });
      setToast({ open: true, type: "success", message: "Rol güncellendi" });
      setDialogOpen(false);
      setFieldErrors({});
    },
    onError: (err) => {
      setFieldErrors(extractFieldErrors(err));
      setToast({ open: true, type: "error", message: getApiErrorMessage(err) });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["roles"] });
      setToast({ open: true, type: "success", message: "Rol silindi" });
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

  const openEdit = (r: AppRole) => {
    setMode("edit");
    setSelected(r);
    setFieldErrors({});
    setDialogOpen(true);
  };

  const onSubmit = (payload: AppRoleRequest) => {
    if (mode === "create") {
      createMut.mutate(payload);
      return;
    }
    if (!selected) return;
    updateMut.mutate({ id: selected.id, payload });
  };

  const onDelete = (r: AppRole) => {
    const ok = window.confirm(`"${r.aciklama}" rolü silinsin mi?`);
    if (!ok) return;
    deleteMut.mutate(r.id);
  };

  const clearFieldError = (field: keyof AppRoleRequest) => {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const filteredSorted = React.useMemo(() => {
    const list = data ?? [];
    const q = normalize(search);

    const filtered = !q
      ? list
      : list.filter((r) => {
          const hay = [r.code, r.aciklama].map(normalize).join(" ");
          return hay.includes(q);
        });

    const sorted = [...filtered].sort((a, b) => {
      const av = normalize(orderBy === "code" ? a.code : a.aciklama);
      const bv = normalize(orderBy === "code" ? b.code : b.aciklama);
      const c = compare(av, bv);
      return order === "asc" ? c : -c;
    });

    return sorted;
  }, [data, search, orderBy, order]);

  React.useEffect(() => {
    setPage(0);
  }, [search, orderBy, order]);

  const paged = React.useMemo(() => {
    const start = page * rowsPerPage;
    return filteredSorted.slice(start, start + rowsPerPage);
  }, [filteredSorted, page, rowsPerPage]);

  const toggleSort = (key: SortKey) => {
    if (orderBy === key) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
      return;
    }
    setOrderBy(key);
    setOrder("asc");
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <div>Hata oluştu</div>;

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Roller</Typography>
        <Button variant="contained" onClick={openCreate}>
          Yeni Rol
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
          Gösterilen: {filteredSorted.length} / Toplam: {data?.length ?? 0}
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
            {paged.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.code}</TableCell>
                <TableCell>{r.aciklama}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => openEdit(r)} aria-label="edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => onDelete(r)} aria-label="delete">
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

      <RoleFormDialog
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
