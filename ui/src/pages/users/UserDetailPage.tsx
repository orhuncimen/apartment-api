import * as React from "react";
import { Box, Paper, Typography, CircularProgress, Stack, Button, Chip } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserById, type AppUser } from "../../api/userApi";
import { getCustomers, type Customer } from "../../api/customerApi";
import { getRoles, type AppRole } from "../../api/roleApi";

function roleChipColor(code?: string):
  | "default" | "primary" | "secondary" | "success" | "info" | "warning" | "error" {
  switch (String(code ?? "").trim()) {
    case "1": return "primary";
    case "2": return "success";
    case "3": return "error";
    case "4": return "info";
    case "5": return "warning";
    default:  return "default";
  }
}

function getUsername(u: any) {
  return (u?.app_user ?? u?.username ?? "").toString();
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const userQ = useQuery<AppUser>({
    queryKey: ["users", id],
    queryFn: () => getUserById(id!),
    enabled: !!id,
  });

  const customersQ = useQuery<Customer[]>({ queryKey: ["customers"], queryFn: getCustomers });
  const rolesQ = useQuery<AppRole[]>({ queryKey: ["roles"], queryFn: getRoles });

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

  if (userQ.isLoading) return <CircularProgress />;
  if (userQ.error || !userQ.data) return <div>Kullanıcı bulunamadı</div>;

  const u: any = userQ.data;

  const username = getUsername(u);
  const customer = customerMap.get(u.customerid ?? u.customerId);
  const role = roleMap.get(u.roleid ?? u.roleId);

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Kullanıcı Detayı</Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Geri
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Typography><b>ID:</b> <span style={{ fontFamily: "monospace" }}>{u.id}</span></Typography>
          <Typography><b>Kullanıcı:</b> {username || "-"}</Typography>

          <Typography>
            <b>Müşteri:</b>{" "}
            {customer ? (
              <Chip
                size="small"
                label={`${customer.name} ${customer.surname}`}
                clickable
                onClick={() => navigate(`/customers/${customer.id}`)}
                variant="outlined"
              />
            ) : (
              <span style={{ fontFamily: "monospace" }}>{u.customerid ?? u.customerId ?? "-"}</span>
            )}
          </Typography>

          <Typography>
            <b>Rol:</b>{" "}
            {role ? (
              <Chip
                size="small"
                label={`${role.aciklama} (code: ${role.code})`}
                color={roleChipColor(role.code)}
                variant="outlined"
              />
            ) : (
              <span style={{ fontFamily: "monospace" }}>{u.roleid ?? u.roleId ?? "-"}</span>
            )}
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
