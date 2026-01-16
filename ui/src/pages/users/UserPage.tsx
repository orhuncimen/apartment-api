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
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  type AppUser,
  type AppUserRequest,
} from "../../api/userApi";
import { getCustomers, type Customer } from "../../api/customerApi";
import { getRoles, type AppRole } from "../../api/roleApi";
import UserFormDialog from "./UserFormDialog";
import { getApiErrorMessage } from "../../api/axios";
import { useNavigate } from "react-router-dom";

type FieldErrors = Partial<Record<keyof AppUserRequest, string>>;
type Order = "asc" | "desc";
type SortKey = "app_user" | "customerName" | "roleName";

function roleChipColor(
  code?: string
): "default" | "primary" | "secondary" | "success" | "info" | "warning" | "error" {
  switch (String(code ?? "").trim()) {
    case "1": return "primary"; // yönetici
    case "2": return "success"; // kat maliki
    case "3": return "error";   // admin
    case "4": return "info";    // misafir
    case "5": return "warning"; // denetci
    default:  return "default";
  }
}

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

  if (m.includes("user")) fe.app_user = msg;
  if (m.includes("password") || m.includes("şifre")) fe.app_password = msg;
  if (m.includes("customer")) fe.customerid = msg;
  if (m.includes("role")) fe.roleid = msg;

  return fe;
}

export default function UserPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const [selected, setSelected] = React.useState<AppUser | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

  const [search, setSearch] = React.useState("");

  const [orderBy, setOrderBy] = React.useState<SortKey>("app_user");
  const [order, setOrder] = React.useState<Order>("asc");

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [toast, setToast] = React.useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({ open: false, type: "success", message: "" });

  const usersQ = useQuery<AppUser[]>({ queryKey: ["users"], queryFn: getUsers });

  const customersQ = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  const rolesQ = useQuery<AppRole[]>({
    queryKey: ["roles"],
    queryFn: getRoles,
  });

  const customerMap = React.useMemo(() => {
    const m = new Map<string, Customer>();
    (customersQ.data ?? []).forEach((c) => m.set(c.id, c));
    return m;
  }, [customersQ.data]);

  const roleMap = React.useMemo(() => {
    const m = new Map<string, AppRole>();
    (rolesQ.data ?? []).forEach((r) => m.set(r.id, r));
    return m;
  }, [rolesQ.data]);

  const createMut = useMutation({
    mutationFn: (payload: AppUserRequest) => createUser(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["users"] });
      setToast({ open: true, type: "success", message: "Kullanıcı oluşturuldu" });
      setDialogOpen(false);
      setFieldErrors({});
    },
    onError: (err) => {
      setFieldErrors(extractFieldErrors(err));
      setToast({ open: true, type: "error", message: getApiErrorMessage(err) });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AppUserRequest }) =>
      updateUser(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["users"] });
      setToast({ open: true, type: "success", message: "Kullanıcı güncellendi" });
      setDialogOpen(false);
      setFieldErrors({});
    },
    onError: (err) => {
      setFieldErrors(extractFieldErrors(err));
      setToast({ open: true, type: "error", message: getApiErrorMessage(err) });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["users"] });
      setToast({ open: true, type: "success", message: "Kullanıcı silindi" });
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

  const openEdit = (u: AppUser) => {
    setMode("edit");
    setSelected(u);
    setFieldErrors({});
    setDialogOpen(true);
  };

  const onSubmit = (payload: AppUserRequest) => {
    if (mode === "create") {
      // create'de şifre zorunlu ise backend zaten validate eder
      createMut.mutate(payload);
      return;
    }
    if (!selected) return;

    // ✅ edit: şifre boşsa göndermeyelim
    const cleaned: AppUserRequest = { ...payload };
    if (!cleaned.app_password || !String(cleaned.app_password).trim()) {
      delete cleaned.app_password;
    }

    updateMut.mutate({ id: selected.id, payload: cleaned });
  };

  const onDelete = (u: AppUser) => {
    const ok = window.confirm(`"${u.app_user}" kullanıcısı silinsin mi?`);
    if (!ok) return;
    deleteMut.mutate(u.id);
  };

  const clearFieldError = (field: keyof AppUserRequest) => {
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

  const users = usersQ.data ?? [];

  const filteredSorted = React.useMemo(() => {
    const q = normalize(search);

    const filtered = !q
      ? users
      : users.filter((u) => {
          const c = customerMap.get(u.customerid);
          const customerName = c ? `${c.name} ${c.surname}` : u.customerid;
          const r = roleMap.get(u.roleid);
          const roleName = r ? `${r.aciklama} (${r.code})` : u.roleid;

          const hay = [u.app_user, customerName, roleName].map(normalize).join(" ");
          return hay.includes(q);
        });

    const sorted = [...filtered].sort((a, b) => {
      const aCustomer = customerMap.get(a.customerid);
      const bCustomer = customerMap.get(b.customerid);
      const aCustomerName = aCustomer ? `${aCustomer.name} ${aCustomer.surname}` : a.customerid;
      const bCustomerName = bCustomer ? `${bCustomer.name} ${bCustomer.surname}` : b.customerid;

      const aRole = roleMap.get(a.roleid);
      const bRole = roleMap.get(b.roleid);
      const aRoleName = aRole ? `${aRole.aciklama} (${aRole.code})` : a.roleid;
      const bRoleName = bRole ? `${bRole.aciklama} (${bRole.code})` : b.roleid;

      const av =
        orderBy === "app_user" ? a.app_user : orderBy === "customerName" ? aCustomerName : aRoleName;
      const bv =
        orderBy === "app_user" ? b.app_user : orderBy === "customerName" ? bCustomerName : bRoleName;

      const c = compare(normalize(av), normalize(bv));
      return order === "asc" ? c : -c;
    });

    return sorted;
  }, [users, search, orderBy, order, customerMap, roleMap]);

  React.useEffect(() => {
    setPage(0);
  }, [search, orderBy, order]);

  const paged = React.useMemo(() => {
    const start = page * rowsPerPage;
    return filteredSorted.slice(start, start + rowsPerPage);
  }, [filteredSorted, page, rowsPerPage]);

  if (usersQ.isLoading) return <CircularProgress />;
  if (usersQ.error) return <div>Hata oluştu</div>;

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Kullanıcılar</Typography>
        <Button variant="contained" onClick={openCreate}>
          Yeni Kullanıcı
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ara: kullanıcı / müşteri / rol"
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
          Gösterilen: {filteredSorted.length} / Toplam: {users.length}
        </Typography>
      </Paper>

      <Paper variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "app_user"}
                  direction={orderBy === "app_user" ? order : "asc"}
                  onClick={() => toggleSort("app_user")}
                >
                  Kullanıcı
                </TableSortLabel>
              </TableCell>

              <TableCell>
                <TableSortLabel
                  active={orderBy === "customerName"}
                  direction={orderBy === "customerName" ? order : "asc"}
                  onClick={() => toggleSort("customerName")}
                >
                  Müşteri
                </TableSortLabel>
              </TableCell>

              <TableCell>
                <TableSortLabel
                  active={orderBy === "roleName"}
                  direction={orderBy === "roleName" ? order : "asc"}
                  onClick={() => toggleSort("roleName")}
                >
                  Rol
                </TableSortLabel>
              </TableCell>

              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paged.map((u) => {
              const c = customerMap.get(u.customerid);
              const r = roleMap.get(u.roleid);

              const customerLabel = c ? `${c.name} ${c.surname}` : u.customerid;

              return (
                <TableRow
                  key={u.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/customers/${u.customerid}`)} // ✅ row click customer detail
                >
                  <TableCell>{u.app_user}</TableCell>

                  <TableCell>
                    {c ? (
                      <Chip
                        size="small"
                        label={customerLabel}
                        variant="outlined"
                        clickable
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customers/${c.id}`);
                        }}
                      />
                    ) : (
                      <span style={{ fontFamily: "monospace" }}>{u.customerid}</span>
                    )}
                  </TableCell>

                  <TableCell>
                    {r ? (
                      <Chip
                        size="small"
                        label={`${r.aciklama} (code: ${r.code})`}
                        color={roleChipColor(r.code)}
                        variant="outlined"
                      />
                    ) : (
                      <span style={{ fontFamily: "monospace" }}>{u.roleid}</span>
                    )}
                  </TableCell>

                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <IconButton onClick={() => openEdit(u)} aria-label="edit">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => onDelete(u)} aria-label="delete">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}

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

      <UserFormDialog
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
