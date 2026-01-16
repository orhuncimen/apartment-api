import * as React from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getKasa, type Kasa } from "../../api/kasaApi"; // sende farklı isimse düzelt

function normalize(s: string) {
  return (s ?? "").toString().trim().toLowerCase();
}

export default function KasaHareketSelectPage() {
  const nav = useNavigate();
  const [search, setSearch] = React.useState("");

  const kasaQ = useQuery<Kasa[]>({
    queryKey: ["kasa"],
    queryFn: getKasa,
  });

  const filtered = React.useMemo(() => {
    const list = kasaQ.data ?? [];
    const q = normalize(search);
    if (!q) return list;

    return list.filter((k) => normalize(String(k.years)).includes(q));
  }, [kasaQ.data, search]);

  if (kasaQ.isLoading) return <CircularProgress />;
  if (kasaQ.error) return <Box p={3}>Kasa listesi yüklenemedi</Box>;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h4">Kasa Hareket</Typography>
          <Typography variant="body2" sx={{ opacity: 0.75 }}>
            Kasa seç, hareket ekranına git
          </Typography>
        </Box>

        <Button variant="outlined" onClick={() => nav("/kasa")}>
          Kasalar
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
          Gösterilen: {filtered.length} / Toplam: {kasaQ.data?.length ?? 0}
        </Typography>
      </Paper>

      <Paper variant="outlined">
        <List disablePadding>
          {filtered.map((k, idx) => (
            <React.Fragment key={k.id}>
              <ListItemButton
                onClick={() => nav(`/kasa/${k.id}/hareket`)}
                sx={{ py: 1.5 }}
              >
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle1">Kasa {k.years}</Typography>
                      <Chip size="small" label={k.years} variant="outlined" />
                    </Stack>
                  }
                  secondary={
                    <Typography variant="caption" sx={{ opacity: 0.75 }}>
                      id: <span style={{ fontFamily: "monospace" }}>{k.id}</span>
                    </Typography>
                  }
                />
                <ArrowForwardIcon />
              </ListItemButton>

              {idx !== filtered.length - 1 && (
                <Box sx={{ borderTop: "1px solid", borderColor: "divider" }} />
              )}
            </React.Fragment>
          ))}

          {filtered.length === 0 && (
            <Box p={2}>
              <Typography>Kayıt yok</Typography>
            </Box>
          )}
        </List>
      </Paper>
    </Box>
  );
}
