import { useState } from 'react'
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box, 
  useMediaQuery, 
  useTheme,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import { 
  Menu as MenuIcon, 
  Person, 
  Settings, 
  ImportExport,
  AccountCircle 
} from '@mui/icons-material'
import { AppButton } from '../design-system'
import Drawer from './Drawer'
import ToolsDrawer from './ToolsDrawer'
import UserSelectionDrawer from './UserSelectionDrawer'

export default function Header({ 
  settings, 
  updateSettings, 
  onImport, 
  onExport, 
  onResetData, 
  currentUser, 
  users, 
  onUserSwitch, 
  isLoading, 
  onShowUserManagement 
}) {
  const [isToolsDrawerOpen, setIsToolsDrawerOpen] = useState(false)
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Main Header */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          gap: 2 
        }}>
          <Box>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #1976d2, #9c27b0)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.5rem', md: '2rem', lg: '2.5rem' }
              }}
            >
              📈 Trade Tracker
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary', 
                mt: 0.5,
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Track your trades with a beautiful, interactive dashboard.
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Mobile Menu */}
            {isMobile ? (
              <IconButton 
                onClick={handleMenuOpen}
                sx={{ color: 'primary.main' }}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              /* Desktop Navigation */
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <AppButton
                  variant="text"
                  onClick={() => setIsUserDrawerOpen(true)}
                  sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                >
                  Switch User
                </AppButton>
                <AppButton
                  variant="text"
                  onClick={() => setIsToolsDrawerOpen(true)}
                  sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                >
                  Tools
                </AppButton>
              </Box>
            )}
            
            {/* Current User Info */}
            {currentUser && (
              <Chip
                icon={<AccountCircle />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{currentUser.avatar}</span>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {currentUser.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {currentUser.role}
                    </Typography>
                  </Box>
                }
                variant="outlined"
                sx={{ 
                  display: { xs: 'none', sm: 'flex' },
                  '& .MuiChip-label': { px: 1 }
                }}
              />
            )}
          </Box>
        </Box>

        {/* Mobile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => { setIsUserDrawerOpen(true); handleMenuClose(); }}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            <ListItemText>Switch User</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { setIsToolsDrawerOpen(true); handleMenuClose(); }}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText>Tools & Settings</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { onImport(); handleMenuClose(); }}>
            <ListItemIcon>
              <ImportExport fontSize="small" />
            </ListItemIcon>
            <ListItemText>Import/Export</ListItemText>
          </MenuItem>
        </Menu>
      </Box>

      {/* Tools & Settings Drawer */}
      <Drawer
        isOpen={isToolsDrawerOpen}
        onClose={() => setIsToolsDrawerOpen(false)}
        title="Tools & Settings"
        size="lg"
      >
        <ToolsDrawer
          settings={settings}
          updateSettings={updateSettings}
          onImport={onImport}
          onExport={onExport}
          onResetData={onResetData}
          currentUser={currentUser}
        />
      </Drawer>

      {/* User Selection Drawer */}
      <Drawer
        isOpen={isUserDrawerOpen}
        onClose={() => setIsUserDrawerOpen(false)}
        title="Select User"
        size="md"
      >
        <UserSelectionDrawer
          users={users}
          currentUser={currentUser}
          onUserSwitch={onUserSwitch}
          onShowUserManagement={onShowUserManagement}
          isLoading={isLoading}
        />
      </Drawer>
    </>
  )
}
