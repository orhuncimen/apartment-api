import * as React from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import PeopleIcon from "@mui/icons-material/People";
import BadgeIcon from "@mui/icons-material/Badge";
import SecurityIcon from "@mui/icons-material/Security";
import ApartmentIcon from "@mui/icons-material/Apartment";
import CategoryIcon from "@mui/icons-material/Category";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CampaignIcon from "@mui/icons-material/Campaign";
import ChecklistIcon from "@mui/icons-material/Checklist";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const drawerWidth = 260;

type NavItem = {
  label: string;
  to: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/", icon: <CategoryIcon /> },
  { label: "Customers", to: "/customers", icon: <PeopleIcon /> },
  { label: "Roles", to: "/roles", icon: <SecurityIcon /> },
  { label: "Users", to: "/users", icon: <BadgeIcon /> },
  { label: "Daireler", to: "/daireler", icon: <ApartmentIcon /> },
  { label: "Ücret Tipleri", to: "/ucrettypes", icon: <CategoryIcon /> },
  { label: "Kasa", to: "/kasa", icon: <AccountBalanceIcon /> },
  { label: "Kasa Hareket", to: "/kasa-hareket", icon: <ReceiptLongIcon /> }, // liste/selector sayfasına bağlayacağız (şimdilik menüde dursun)
  { label: "Duyurular", to: "/duyurular", icon: <CampaignIcon /> },
  { label: "Yapılacaklar", to: "/yapilacaklar", icon: <ChecklistIcon /> },
];

function TopTitle() {
  const location = useLocation();
  const found = navItems.find((x) => x.to === location.pathname);
  return found?.label ?? "Portal";
}

export default function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => setMobileOpen((p) => !p);

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar>
        <Typography variant="h6" noWrap>
          Apartment Portal
        </Typography>
      </Toolbar>

      <Divider />

      <List sx={{ flex: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            onClick={() => isMobile && setMobileOpen(false)}
            sx={{
              "&.active": {
                bgcolor: "action.selected",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 42 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      <Divider />

      <Box sx={{ p: 2, opacity: 0.7 }}>
        <Typography variant="caption">v0.1</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {isMobile && (
            <IconButton edge="start" onClick={handleDrawerToggle} aria-label="menu">
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" noWrap>
            <TopTitle />
          </Typography>

          <Box sx={{ flex: 1 }} />
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {/* Mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          bgcolor: "background.default",
          p: 3,
          pt: 10, // AppBar boşluğu
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
