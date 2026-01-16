import * as React from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Stack,
  Chip,
  Divider,
  Button,
} from "@mui/material";
import { getCustomerById } from "../../api/customerApi";
import { getUsers, type AppUser } from "../../api/userApi";
import { getRoles, type AppRole } from "../../api/roleApi";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const customerId = id ?? "";

  const customerQ = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => getCustomerById(customerId),
    enabled: !!customerId,
  });

  const usersQ = useQuery<AppUser[]>({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const rolesQ = useQuery<AppRole[]>({
    queryKey: ["roles"],
    queryFn: getRoles,
  });

  const roleMap = React.useMemo(() => {
    const m = new Map<string, AppRole>();
    (rolesQ.data ?? []).forEach((r) => m.set(r.id, r));
    return m;
  }, [rolesQ.data]);

  const usersOfCustomer = React.useMemo(() => {
    const all = usersQ.data ?? [];
    return all.filter((u) => u.customerid === customerId);
  }, [usersQ.data, customerId]);

  if (!customerId) return <div>Geçersiz müşteri id</div>;
  if (customerQ.isLoading) return <CircularProgress />;
  if (customerQ.error) return <div>Hata oluştu</div>;

  const c = customerQ.data!;

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Müşteri Detay</Typography>

        <Button component={RouterLink} to="/customers" variant="outlined">
          Listeye Dön
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack spacing={1}>
          <Typography variant="h6">
            {c.name} {c.surname}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={`Tel: ${c.tel}`} />
            <Chip label={`Email: ${c.email || "-"}`} />
            <Chip label={`ID: ${c.id}`} sx={{ fontFamily: "monospace" }} />
          </Stack>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Bu müşteriye bağlı kullanıcılar</Typography>
          <Chip label={`Toplam: ${usersOfCustomer.length}`} />
        </Stack>

        <Divider sx={{ my: 2 }} />

        {usersQ.isLoading && <CircularProgress size={22} />}
        {usersQ.error && <Typography color="error">Users yüklenemedi</Typography>}

        {!usersQ.isLoading && usersOfCustomer.length === 0 && (
          <Typography>Bu müşteriye bağlı kullanıcı yok.</Typography>
        )}

        <Stack spacing={1}>
          {usersOfCustomer.map((u) => {
            const role = roleMap.get(u.roleid);
            return (
              <Paper key={u.id} variant="outlined" sx={{ p: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography>
                    <b>{u.app_user}</b>
                  </Typography>

                  {role ? (
                    <Chip label={`${role.aciklama} (code: ${role.code})`} />
                  ) : (
                    <Chip label={`RoleId: ${u.roleid}`} sx={{ fontFamily: "monospace" }} />
                  )}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      </Paper>
    </Box>
  );
}
