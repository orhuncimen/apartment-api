import * as React from "react";
import { Box, Card, CardContent, Typography, Grid, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const nav = useNavigate();

  return (
    <Box>
      <Typography variant="h4" mb={2}>
        Dashboard
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                Hızlı Erişim
              </Typography>
              <Typography variant="h6">Müşteriler</Typography>
              <Button sx={{ mt: 1 }} variant="contained" onClick={() => nav("/customers")}>
                Git
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                Hızlı Erişim
              </Typography>
              <Typography variant="h6">Kullanıcılar</Typography>
              <Button sx={{ mt: 1 }} variant="contained" onClick={() => nav("/users")}>
                Git
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                Hızlı Erişim
              </Typography>
              <Typography variant="h6">Kasa</Typography>
              <Button sx={{ mt: 1 }} variant="contained" onClick={() => nav("/kasa")}>
                Git
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                Hızlı Erişim
              </Typography>
              <Typography variant="h6">Yapılacaklar</Typography>
              <Button sx={{ mt: 1 }} variant="contained" onClick={() => nav("/yapilacaklar")}>
                Git
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={3}>
        <Button variant="outlined" onClick={() => nav("/duyurular")}>
          Aktif Duyurular
        </Button>
        <Button variant="outlined" onClick={() => nav("/ucrettypes")}>
          Ücret Tipleri
        </Button>
        <Button variant="outlined" onClick={() => nav("/roles")}>
          Roller
        </Button>
        <Button variant="outlined" onClick={() => nav("/daireler")}>
          Daireler
        </Button>
      </Stack>
    </Box>
  );
}
