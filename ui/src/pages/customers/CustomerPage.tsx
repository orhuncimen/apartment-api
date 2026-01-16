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
  FormControlLabel,
  Switch,
  TablePagination,
  TableSortLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  type Customer,
  type CustomerRequest,
} from "../../api/customerApi";
import CustomerFormDialog from "./CustomerFormDialog";
import { getApiErrorMessage } from "../../api/axios";

type FieldErrors = Partial<Record<keyof CustomerRequest, string>>;

function extractFieldErrors(err: unknown): FieldErrors {
  if (!axios.isAxiosError(err)) return {};

  const data: any = err.response?.data;

  if (data?.errors && typeof data.errors === "object" && !Array.isArray(data.errors)) {
    return data.errors as FieldErrors;
  }

  const msg = data?.message ? String(data.message) : "";
  const fe: FieldErrors = {};

  if (msg.toLowerCase().includes("telefon")) fe.tel = msg;
  if (msg.toLowerCase().includes("email")) fe.email = msg;

  return fe;
}

function normalize(s: string) {
  return (s ?? "").toString().trim().toLowerCase();
}

type Order = "asc" | "desc";
type SortField = "name" | "surname" | "tel";

export default function CustomerPage() {
  const qc = useQueryClient();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const [selected, setSelected] = React.useState<Customer | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

  // Search/Filter state
  const [search, setSearch] = React.useState("");
  const [onlyWithEmail, setOnlyWithEmail] = React.useState(false);

  // Pagination state
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(4);

  // ✅ Sort state
  const [orderBy, setOrderBy] = React.useState<SortField>("name");
  const [order, setOrder] = React.useState<Order>("asc");

  const handleSort = (field: SortField) => {
    const isAsc = orderBy === field && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(field);
  };

  const [toast, setToast] = React.useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({ open: false, type: "success", message: "" });

  const { data, isLoading, error } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  const createMut = useMutation({
    mutationFn: (payload: CustomerRequest) => createCustomer(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["customers"] });
      setToast({ open: true, type: "success", message: "Müşteri oluşturuldu" });
      setDialogOpen(false);
      setFieldErrors({});
    },
    onError: (err) => {
      setFieldErrors(extractFieldErrors(err));
      setToast({ open: true, type: "error", message: getApiErrorMessage(err) });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CustomerRequest }) =>
      updateCustomer(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["customers"] });
      setToast({ open: true, type: "success", message: "Müşteri güncellendi" });
      setDialogOpen(false);
      setFieldErrors({});
    },
    onError: (err) => {
      setFieldErrors(extractFieldErrors(err));
      setToast({ open: true, type: "error", message: getApiErrorMessage(err) });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["customers"] });
      setToast({ open: true, type: "success", message: "Müşteri silindi" });
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

  const openEdit = (c: Customer) => {
    setMode("edit");
    setSelected(c);
    setFieldErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setFieldErrors({});
  };

  const onSubmit = (payload: CustomerRequest) => {
    if (mode === "create") {
      createMut.mutate(payload);
      return;
    }
    if (!selected) return;
    updateMut.mutate({ id: selected.id, payload });
  };

  const onDelete = (c: Customer) => {
    const ok = window.confirm(`${c.name} ${c.surname} silinsin mi?`);
    if (!ok) return;
    deleteMut.mutate(c.id);
  };

  const clearFieldError = (field: keyof CustomerRequest) => {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Filtered list (client-side)
  const filtered = React.useMemo(() => {
    const list = data ?? [];
    const q = normalize(search);

    return list.filter((c) => {
      if (onlyWithEmail) {
        if (!normalize(c.email)) return false;
      }

      if (!q) return true;

      const haystack = [
        c.name,
        c.surname,
        c.tel,
        c.email,
        `${c.name} ${c.surname}`,
      ]
        .map(normalize)
        .join(" ");

      return haystack.includes(q);
    });
  }, [data, search, onlyWithEmail]);

  // ✅ Sorted list (client-side)
  const sorted = React.useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = (a[orderBy] ?? "").toString().toLowerCase();
      const bVal = (b[orderBy] ?? "").toString().toLowerCase();

      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, orderBy, order]);

  // ✅ filter değişince sayfayı sıfırla (boş sayfaya düşmemek için)
  React.useEffect(() => {
    setPage(0);
  }, [search, onlyWithEmail, orderBy, order]);

  // ✅ paged data (sorted üzerinden)
  const pagedData = React.useMemo(() => {
    const start = page * rowsPerPage;
    return sorted.slice(start, start + rowsPerPage);
  }, [sorted, page, rowsPerPage]);

  if (isLoading) return <CircularProgress />;
  if (error) return <div>Hata oluştu</div>;

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Müşteriler</Typography>
        <Button variant="contained" onClick={openCreate}>
          Yeni Müşteri
        </Button>
      </Stack>

      {/* Search/Filter Bar */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ara: ad, soyad, telefon, email..."
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
              <Switch
                checked={onlyWithEmail}
                onChange={(e) => setOnlyWithEmail(e.target.checked)}
              />
            }
            label="Sadece email olanlar"
          />

          <Button
            variant="outlined"
            onClick={() => {
              setSearch("");
              setOnlyWithEmail(false);
            }}
          >
            Temizle
          </Button>
        </Stack>

        <Typography variant="body2" sx={{ mt: 1, opacity: 0.75 }}>
          Gösterilen: {filtered.length} / Toplam: {data?.length ?? 0}
        </Typography>
      </Paper>

      <Paper variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sortDirection={orderBy === "name" ? order : false}>
                <TableSortLabel
                  active={orderBy === "name"}
                  direction={orderBy === "name" ? order : "asc"}
                  onClick={() => handleSort("name")}
                >
                  Ad
                </TableSortLabel>
              </TableCell>

              <TableCell sortDirection={orderBy === "surname" ? order : false}>
                <TableSortLabel
                  active={orderBy === "surname"}
                  direction={orderBy === "surname" ? order : "asc"}
                  onClick={() => handleSort("surname")}
                >
                  Soyad
                </TableSortLabel>
              </TableCell>

              <TableCell sortDirection={orderBy === "tel" ? order : false}>
                <TableSortLabel
                  active={orderBy === "tel"}
                  direction={orderBy === "tel" ? order : "asc"}
                  onClick={() => handleSort("tel")}
                >
                  Telefon
                </TableSortLabel>
              </TableCell>

              <TableCell>Email</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {pagedData.map((c) => (
              <TableRow key={c.id} hover>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.surname}</TableCell>
                <TableCell>{c.tel}</TableCell>
                <TableCell>{c.email || "-"}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => openEdit(c)} aria-label="edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => onDelete(c)} aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>Kayıt yok</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filtered.length}
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

      <CustomerFormDialog
        open={dialogOpen}
        mode={mode}
        initial={selected}
        onClose={closeDialog}
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
