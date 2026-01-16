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
type SortKey = "username" | "customerName" | "roleName";

/**
 * ✅ SENDEKİ BACKEND alan adları:
 * - app_user, customerid, roleid, app_password
 *
 * Bazı dosyalarda username/customerId/roleId kullanmış olabilirsin.
 * Aşağıdaki helperlar iki formatı da destekler => ekranda boş alan sorunu biter.
 */
function getUsername(u: AppUser): string {
  return ((u as any).username ?? (u as any).app_user ?? "").toString();
}
function getCustomerId(u: AppUser): string {
  return ((u as any).customerId ?? (u as any).customerid ?? "").toString();
}
function getRoleId(u: AppUser): string {
  return ((u as any).roleId ?? (u as any).roleid ?? "").toString();
}

function roleChipColor(
  code?: string
):
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error" {
  switch (String(code ?? "").trim()) {
    case "1":
      return "primary"; // yönetici
    case "2":
      return "success"; // kat maliki
    case "3":
      return "error"; // admin
    case "4":
      return "info"; // misafir
    case "5":
      return "warning"; // denetci
    default:
      return "default";
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
  const fe: FieldErrors = {};
  const m = msg.toLowerCase();

  // hem username hem app_user yakalasın diye:
  if (m.includes("user")) (fe as any).username = msg;
  if (m.includes("password") || m.includes("şifre")) (fe as any).password = msg;
  if (m.includes("customer")) (fe as any).customerId = msg;
  if (m.includes("role")) (fe as any).roleId = msg;

  return fe;
}

export default function UserPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const [selected, setSelected] = React.useState<AppUser | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

  const [search, setSearch] = React.useState("");

  // sort
  const [orderBy, setOrderBy] = React.useState<SortKey>("username");
  const [order, setOrder] = React.useState<Order>("asc");

  // pagination
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [toast, setToast] = React.useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({ open: false, type: "success", message: "" });

  const usersQ = useQuery<AppUser[]>({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const customersQ = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  const rolesQ = useQuery<AppRole[]>({
    queryKey: ["roles"],
    queryFn: getRoles,
  });

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
    // ✅ edit modunda şifre boşsa gönderme (undefined bırak)
    const cleaned: any = { ...payload };
    const pw =
      (cleaned.password ?? cleaned.app_password ?? "").toString().trim();

    if (!pw) {
      delete cleaned.password;
      delete cleaned.app_password;
    } else {
      // hangisi varsa onu taşı
      if (cleaned.password !== undefined) cleaned.password = pw;
      if (cleaned.app_password !== undefined) cleaned.app_password = pw;
    }

    if (mode === "create") {
      createMut.mutate(cleaned as AppUserRequest);
      return;
    }
    if (!selected) return;
    updateMut.mutate({ id: (selected as any).id, payload: cleaned as AppUserRequest });
  };

  const onDelete = (u: AppUser) => {
    const ok = window.confirm(`"${getUsername(u)}" kullanıcısı silinsin mi?`);
    if (!ok) return;
    deleteMut.mutate((u as any).id);
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

  // id -> customer obj
  const customerObjMap = React.useMemo(() => {
    const m = new Map<string, Customer>();
    (customersQ.data ?? []).forEach((c) => m.set(c.id, c));
    return m;
  }, [customersQ.data]);

  // id -> role obj
  const roleObjMap = React.useMemo(() => {
    const m = new Map<string, AppRole>();
    (rolesQ.data ?? []).forEach((r) => m.set(r.id, r));
    return m;
  }, [rolesQ.data]);

  const users = usersQ.data ?? [];

  const filteredSorted = React.useMemo(() => {
    const q = normalize(search);

    const filtered = !q
      ? users
      : users.filter((u) => {
          const username = getUsername(u);
          const customerId = getCustomerId(u);
          const roleId = getRoleId(u);

          const c = customerObjMap.get(customerId);
          const r = roleObjMap.get(roleId);

          const customerText = c
            ? `${c.name} ${c.surname} ${c.tel} ${c.email ?? ""}`
            : customerId;

          const roleText = r ? `${r.aciklama} ${r.code}` : roleId;

          const hay = [username, customerText, roleText].map(normalize).join(" ");
          return hay.includes(q);
        });

    const sorted = [...filtered].sort((a, b) => {
      const aUsername = getUsername(a);
      const bUsername = getUsername(b);

      const aCustomerId = getCustomerId(a);
      const bCustomerId = getCustomerId(b);

      const aRoleId = getRoleId(a);
      const bRoleId = getRoleId(b);

      const aCustomerName = customerObjMap.get(aCustomerId)
        ? `${customerObjMap.get(aCustomerId)!.name} ${customerObjMap.get(aCustomerId)!.surname}`
        : aCustomerId;

      const bCustomerName = customerObjMap.get(bCustomerId)
        ? `${customerObjMap.get(bCustomerId)!.name} ${customerObjMap.get(bCustomerId)!.surname}`
        : bCustomerId;

      const aRoleName = roleObjMap.get(aRoleId)
        ? `${roleObjMap.get(aRoleId)!.aciklama} (${roleObjMap.get(aRoleId)!.code})`
        : aRoleId;

      const bRoleName = roleObjMap.get(bRoleId)
        ? `${roleObjMap.get(bRoleId)!.aciklama} (${roleObjMap.get(bRoleId)!.code})`
        : bRoleId;

      const av =
        orderBy === "username"
          ? aUsername
          : orderBy === "customerName"
          ? aCustomerName
          : aRoleName;

      const bv =
        orderBy === "username"
          ? bUsername
          : orderBy === "customerName"
          ? bCustomerName
          : bRoleName;

      const c = compare(normalize(av), normalize(bv));
      return order === "asc" ? c : -c;
    });

    return sorted;
  }, [users, search, orderBy, order, customerObjMap, roleObjMap]);

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
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
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
                  active={orderBy === "username"}
                  direction={orderBy === "username" ? order : "asc"}
                  onClick={() => toggleSort("username")}
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
              const username = getUsername(u);
              const customerId = getCustomerId(u);
              const roleId = getRoleId(u);

              const c = customerObjMap.get(customerId);
              const r = roleObjMap.get(roleId);

              return (
                <TableRow
                  key={(u as any).id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => {
                    if (customerId) navigate(`/customers/${customerId}`);
                  }}
                >
                  <TableCell>{username}</TableCell>

                  <TableCell>
                    {c ? (
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`${c.name} ${c.surname} • ${c.tel}`}
                      />
                    ) : (
                      <span style={{ fontFamily: "monospace" }}>
                        {customerId || "-"}
                      </span>
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
                      <span style={{ fontFamily: "monospace" }}>
                        {roleId || "-"}
                      </span>
                    )}
                  </TableCell>

                  <TableCell align="right">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(u);
                      }}
                      aria-label="edit"
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(u);
                      }}
                      aria-label="delete"
                    >
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
