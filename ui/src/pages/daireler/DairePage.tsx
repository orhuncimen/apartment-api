import * as React from "react";
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
  MenuItem,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDaireler,
  getDairelerByUser,
  createDaire,
  updateDaire,
  deleteDaire,
  type Daire,
  type DaireRequest,
} from "../../api/daireApi";
import { getUsers, type AppUser } from "../../api/userApi";
import DaireFormDialog from "./DaireFormDialog";
import { getApiErrorMessage } from "../../api/axios";
import { useNavigate } from "react-router-dom";

type Order = "asc" | "desc";
type SortKey = "daireno" | "username";

function normalize(s: string) {
  return (s ?? "").toString().trim().toLowerCase();
}
function compare(a: string, b: string) {
  return a.localeCompare(b, "tr", { sensitivity: "base" });
}
function getUsername(u: AppUser): string {
  return ((u as any).app_user ?? (u as any).username ?? "").toString();
}

export default function DairePage() {

  const navigate = useNavigate();
  const qc = useQueryClient();

  // dialog
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const [selected, setSelected] = React.useState<Daire | null>(null);

  // filters
  const [search, setSearch] = React.useState("");
  const [filterUserId, setFilterUserId] = React.useState<string>(""); // optional

  // sort
  const [orderBy, setOrderBy] = React.useState<SortKey>("daireno");
  const [order, setOrder] = React.useState<Order>("asc");

  // pagination
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [toast, setToast] = React.useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({ open: false, type: "success", message: "" });

  const usersQ = useQuery<AppUser[]>({ queryKey: ["users"], queryFn: getUsers });

  const dairelerQ = useQuery<Daire[]>({
    queryKey: ["daireler", filterUserId || "all"],
    queryFn: () => (filterUserId ? getDairelerByUser(filterUserId) : getDaireler()),
  });

  const userMap = React.useMemo(() => {
    const m = new Map<string, AppUser>();
    (usersQ.data ?? []).forEach((u) => m.set((u as any).id, u));
    return m;
  }, [usersQ.data]);

  const createMut = useMutation({
    mutationFn: (payload: DaireRequest) => createDaire(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["daireler"] });
      setToast({ open: true, type: "success", message: "Daire oluşturuldu" });
      setDialogOpen(false);
    },
    onError: (err) => setToast({ open: true, type: "error", message: getApiErrorMessage(err) }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DaireRequest }) => updateDaire(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["daireler"] });
      setToast({ open: true, type: "success", message: "Daire güncellendi" });
      setDialogOpen(false);
    },
    onError: (err) => setToast({ open: true, type: "error", message: getApiErrorMessage(err) }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteDaire(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["daireler"] });
      setToast({ open: true, type: "success", message: "Daire silindi" });
    },
    onError: (err) => setToast({ open: true, type: "error", message: getApiErrorMessage(err) }),
  });

  const openCreate = () => {
    setMode("create");
    setSelected(null);
    setDialogOpen(true);
  };

  const openEdit = (d: Daire) => {
    setMode("edit");
    setSelected(d);
    setDialogOpen(true);
  };

  const onSubmit = (payload: DaireRequest) => {
    if (mode === "create") {
      createMut.mutate(payload);
      return;
    }
    if (!selected) return;
    updateMut.mutate({ id: selected.id, payload });
  };

  const onDelete = (d: Daire) => {
    const ok = window.confirm(`Daire "${d.daireno}" silinsin mi?`);
    if (!ok) return;
    deleteMut.mutate(d.id);
  };

  const toggleSort = (key: SortKey) => {
    if (orderBy === key) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
      return;
    }
    setOrderBy(key);
    setOrder("asc");
  };

  const list = dairelerQ.data ?? [];

  const filteredSorted = React.useMemo(() => {
    const q = normalize(search);

    const filtered = !q
      ? list
      : list.filter((d) => {
          const u = userMap.get(d.userid);
          const username = u ? getUsername(u) : "";
          const hay = [d.daireno, d.userid, username].map(normalize).join(" ");
          return hay.includes(q);
        });

    return [...filtered].sort((a, b) => {
      const au = userMap.get(a.userid);
      const bu = userMap.get(b.userid);

      const aUsername = au ? getUsername(au) : a.userid;
      const bUsername = bu ? getUsername(bu) : b.userid;

      const av = orderBy === "daireno" ? a.daireno : aUsername;
      const bv = orderBy === "daireno" ? b.daireno : bUsername;

      const c = compare(normalize(av), normalize(bv));
      return order === "asc" ? c : -c;
    });
  }, [list, search, orderBy, order, userMap]);

  React.useEffect(() => setPage(0), [search, orderBy, order, filterUserId]);

  const paged = React.useMemo(() => {
    const start = page * rowsPerPage;
    return filteredSorted.slice(start, start + rowsPerPage);
  }, [filteredSorted, page, rowsPerPage]);

  if (usersQ.isLoading || dairelerQ.isLoading) return <CircularProgress />;
  if (usersQ.error || dairelerQ.error) return <div>Hata oluştu</div>;

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Daireler</Typography>
        <Button variant="contained" onClick={openCreate}>
          Yeni Daire
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ara: daire no / kullanıcı"
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
            select
            label="Kullanıcı filtresi"
            value={filterUserId}
            onChange={(e) => setFilterUserId(e.target.value)}
            sx={{ minWidth: 260 }}
          >
            <MenuItem value="">Tümü</MenuItem>
            {(usersQ.data ?? []).map((u) => (
              <MenuItem key={(u as any).id} value={(u as any).id}>
                {getUsername(u) || (u as any).id}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="outlined"
            onClick={() => {
              setSearch("");
              setFilterUserId("");
            }}
          >
            Temizle
          </Button>
        </Stack>

        <Typography variant="body2" sx={{ mt: 1, opacity: 0.75 }}>
          Gösterilen: {filteredSorted.length} / Toplam: {list.length}
        </Typography>
      </Paper>

      <Paper variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "daireno"}
                  direction={orderBy === "daireno" ? order : "asc"}
                  onClick={() => toggleSort("daireno")}
                >
                  Daire No
                </TableSortLabel>
              </TableCell>

              <TableCell>
                <TableSortLabel
                  active={orderBy === "username"}
                  direction={orderBy === "username" ? order : "asc"}
                  onClick={() => toggleSort("username")}
                >
                  Kullanıcı
                </TableSortLabel>
              </TableCell>

              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paged.map((d) => {
              const u = userMap.get(d.userid);
              const username = u ? getUsername(u) : "";





              return (
                <TableRow key={d.id} hover>
                  <TableCell>{d.daireno}</TableCell>

                  <TableCell>

                    {username ? (
                      <Chip size="small" variant="outlined" label={username} clickable onClick={(e) => { e.stopPropagation(); navigate(`/users/${d.userid}`); }}/>
                    ) : (
                      <span style={{ fontFamily: "monospace" }}>{d.userid}</span>
                    )}
                  </TableCell>

                  <TableCell align="right">
                    <IconButton onClick={() => openEdit(d)} aria-label="edit">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => onDelete(d)} aria-label="delete">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}

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

      <DaireFormDialog
        open={dialogOpen}
        mode={mode}
        initial={selected}
        users={usersQ.data ?? []}
        onClose={() => setDialogOpen(false)}
        onSubmit={onSubmit}
        isSubmitting={createMut.isPending || updateMut.isPending}
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
