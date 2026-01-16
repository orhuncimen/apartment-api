import * as React from "react";
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Paper,
  Stack,
  Snackbar,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Chip,
  Divider,
  TextField,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "../../api/axios";
import {
  getKasaHareketByKasa,
  createKasaHareket,
  deleteKasaHareket,
  getKasaSummary,
  getKasaMonthlySummary,
  type KasaHareket,
  type KasaHareketRequest,
  type KasaDirection,
} from "../../api/kasaHareketApi";
import { getDaireler } from "../../api/daireApi";
import { getUcretTypes } from "../../api/ucretTypeApi";
import KasaHareketFormDialog from "./KasaHareketFormDialog";

type FieldErrors = Partial<Record<keyof KasaHareketRequest, string>>;

function dirChipColor(dir: KasaDirection) {
  return dir === "IN" ? "success" : "error";
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

  if (m.includes("amount") || m.includes("tutar")) fe.amount = msg;
  if (m.includes("direction")) fe.direction = msg;
  if (m.includes("kasa")) fe.kasaid = msg;
  if (m.includes("daire")) fe.daireid = msg;
  if (m.includes("ucret") || m.includes("ücret")) fe.ucrettypeid = msg;

  return fe;
}

export default function KasaHareketPage() {
  const { kasaid } = useParams();
  const id = String(kasaid ?? "");

  // ✅ UUID guard (kasaid literal "kasaid" gelirse backend 500 olmasın)
  const isUuid = React.useMemo(() => {
    const s = (id ?? "").trim();
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
  }, [id]);

  const qc = useQueryClient();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

  const now = new Date();
  const [year, setYear] = React.useState<number>(now.getFullYear());
  const [month, setMonth] = React.useState<number>(now.getMonth() + 1); // 1-12

  const [toast, setToast] = React.useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({ open: false, type: "success", message: "" });

  // ✅ kasaid yoksa veya UUID değilse API çağırma
  const hareketQ = useQuery<KasaHareket[]>({
    queryKey: ["kasa-hareket", id],
    queryFn: () => getKasaHareketByKasa(id),
    enabled: isUuid,
  });

  const summaryQ = useQuery({
    queryKey: ["kasa-summary", id],
    queryFn: () => getKasaSummary(id),
    enabled: isUuid,
  });

  const monthlyQ = useQuery({
    queryKey: ["kasa-monthly", id, year, month],
    queryFn: () => getKasaMonthlySummary(id, year, month),
    enabled: isUuid,
  });

  // map için (opsiyonel)
  const daireQ = useQuery({
    queryKey: ["daireler"],
    queryFn: getDaireler,
    enabled: isUuid, // istersen true da olabilir ama bu sayfada sadece kasa için lazım
  });

  const ucretQ = useQuery({
    queryKey: ["ucrettypes"],
    queryFn: getUcretTypes,
    enabled: isUuid,
  });

  const daireMap = React.useMemo(() => {
    const m = new Map<string, string>();
    (daireQ.data ?? []).forEach((d: any) => m.set(d.id, `Daire ${d.daireno}`));
    return m;
  }, [daireQ.data]);

  const ucretMap = React.useMemo(() => {
    const m = new Map<string, string>();
    (ucretQ.data ?? []).forEach((u: any) => m.set(u.id, `${u.aciklama} (code:${u.code})`));
    return m;
  }, [ucretQ.data]);

  const createMut = useMutation({
    mutationFn: (payload: KasaHareketRequest) => createKasaHareket(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["kasa-hareket", id] });
      await qc.invalidateQueries({ queryKey: ["kasa-summary", id] });
      await qc.invalidateQueries({ queryKey: ["kasa-monthly", id, year, month] });
      setToast({ open: true, type: "success", message: "Hareket eklendi" });
      setDialogOpen(false);
      setFieldErrors({});
    },
    onError: (err) => {
      setFieldErrors(extractFieldErrors(err));
      setToast({ open: true, type: "error", message: getApiErrorMessage(err) });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (hid: string) => deleteKasaHareket(hid),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["kasa-hareket", id] });
      await qc.invalidateQueries({ queryKey: ["kasa-summary", id] });
      await qc.invalidateQueries({ queryKey: ["kasa-monthly", id, year, month] });
      setToast({ open: true, type: "success", message: "Hareket silindi" });
    },
    onError: (err) => {
      setToast({ open: true, type: "error", message: getApiErrorMessage(err) });
    },
  });

  const onDelete = (h: KasaHareket) => {
    const ok = window.confirm("Bu hareket silinsin mi?");
    if (!ok) return;
    deleteMut.mutate(h.id);
  };

  // ✅ URL param hiç yoksa
  if (!id) {
    return (
      <Box p={3}>
        <Typography variant="h6">kasaid bulunamadı</Typography>
      </Box>
    );
  }

  // ✅ UUID değilse API çağırmadan düzgün mesaj göster
  if (!isUuid) {
    return (
      <Box p={3}>
        <Typography variant="h6">Geçersiz kasa id</Typography>
        <Typography variant="body2" sx={{ opacity: 0.75, mt: 1 }}>
          URL’de UUID bekleniyor. Gelen:{" "}
          <span style={{ fontFamily: "monospace" }}>{id}</span>
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75, mt: 1 }}>
          Doğru örnek: <span style={{ fontFamily: "monospace" }}>/kasa/&lt;uuid&gt;/hareket</span>
        </Typography>
      </Box>
    );
  }

  const loadingAny = hareketQ.isLoading || summaryQ.isLoading || monthlyQ.isLoading;
  if (loadingAny) return <CircularProgress />;

  if (hareketQ.error) return <div>Hareket listesi hata</div>;

  const hareketler = hareketQ.data ?? [];
  const summary = summaryQ.data as any;
  const monthly = monthlyQ.data as any;

  const months = Array.from({ length: 12 }).map((_, i) => i + 1);

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h4">Kasa Hareket</Typography>
          <Typography variant="body2" sx={{ opacity: 0.75 }}>
            kasaid: <span style={{ fontFamily: "monospace" }}>{id}</span>
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setDialogOpen(true);
            setFieldErrors({});
          }}
        >
          Yeni Hareket
        </Button>
      </Stack>

      {/* SUMMARY */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" mb={1}>
          Özet
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
          <Chip label={`Total IN: ${summary?.totalIn ?? 0}`} color="success" variant="outlined" />
          <Chip label={`Total OUT: ${summary?.totalOut ?? 0}`} color="error" variant="outlined" />
          <Chip label={`Balance: ${summary?.balance ?? 0}`} color="info" variant="outlined" />
          <Chip label={`Hareket: ${summary?.hareketCount ?? 0}`} variant="outlined" />
          <Chip label={`IN Count: ${summary?.inCount ?? 0}`} variant="outlined" />
          <Chip label={`OUT Count: ${summary?.outCount ?? 0}`} variant="outlined" />
          <Chip label={`Last: ${summary?.lastTransactionDate ?? "-"}`} variant="outlined" />
        </Stack>
      </Paper>

      {/* MONTHLY SUMMARY */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
          mb={1}
        >
          <Typography variant="h6">Aylık Özet</Typography>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Yıl"
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              size="small"
              sx={{ width: 120 }}
            />
            <TextField
              label="Ay"
              select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              size="small"
              sx={{ width: 120 }}
            >
              {months.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap" mb={2}>
          <Chip label={`Total IN: ${monthly?.totalIn ?? 0}`} color="success" variant="outlined" />
          <Chip label={`Total OUT: ${monthly?.totalOut ?? 0}`} color="error" variant="outlined" />
          <Chip label={`Balance: ${monthly?.balance ?? 0}`} color="info" variant="outlined" />
          <Chip label={`Hareket: ${monthly?.hareketCount ?? 0}`} variant="outlined" />
          <Chip label={`IN Count: ${monthly?.inCount ?? 0}`} variant="outlined" />
          <Chip label={`OUT Count: ${monthly?.outCount ?? 0}`} variant="outlined" />
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Typography variant="subtitle1" mb={1}>
          Günlük Breakdown
        </Typography>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tarih</TableCell>
              <TableCell>Total IN</TableCell>
              <TableCell>Total OUT</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(monthly?.daily ?? []).map((d: any) => (
              <TableRow key={d.date} hover>
                <TableCell sx={{ fontFamily: "monospace" }}>{d.date}</TableCell>
                <TableCell>{d.totalIn}</TableCell>
                <TableCell>{d.totalOut}</TableCell>
              </TableRow>
            ))}

            {(monthly?.daily?.length ?? 0) === 0 && (
              <TableRow>
                <TableCell colSpan={3}>Kayıt yok</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* TRANSACTIONS LIST */}
      <Paper variant="outlined">
        <Box p={2}>
          <Typography variant="h6">Hareket Listesi</Typography>
          <Typography variant="body2" sx={{ opacity: 0.75 }}>
            Toplam: {hareketler.length}
          </Typography>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Direction</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Daire</TableCell>
              <TableCell>Ücret Tipi</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {hareketler.map((h) => (
              <TableRow key={h.id} hover>
                <TableCell>
                  <Chip
                    size="small"
                    label={h.direction}
                    color={dirChipColor(h.direction)}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{h.amount}</TableCell>
                <TableCell>
                  {h.daireid ? (daireMap.get(h.daireid) ?? h.daireid) : "-"}
                </TableCell>
                <TableCell>
                  {h.ucrettypeid ? (ucretMap.get(h.ucrettypeid) ?? h.ucrettypeid) : "-"}
                </TableCell>
                <TableCell>{h.description ?? "-"}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => onDelete(h)} aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {hareketler.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>Kayıt yok</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <KasaHareketFormDialog
        open={dialogOpen}
        kasaid={id}
        onClose={() => {
          setDialogOpen(false);
          setFieldErrors({});
        }}
        onSubmit={(payload) => createMut.mutate(payload)}
        isSubmitting={createMut.isPending}
        daireler={daireQ.data ?? []}
        ucretTypes={ucretQ.data ?? []}
        fieldErrors={fieldErrors}
        onClearFieldError={(f) => setFieldErrors((p) => ({ ...p, [f]: undefined }))}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
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
