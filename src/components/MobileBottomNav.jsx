import React from 'react'
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material'
import { 
  Dashboard as DashboardIcon, 
  Add as AddIcon, 
  List as ListIcon,
  Person as PersonIcon,
  Settings as SettingsIcon
} from '@mui/icons-material'

export default function MobileBottomNav({ 
  currentTab, 
  onTabChange, 
  onShowUserManagement,
  onShowTools,
  onShowTradeForm 
}) {
  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        display: { xs: 'block', md: 'none' }
      }} 
      elevation={3}
    >
      <BottomNavigation
        value={currentTab}
        onChange={(event, newValue) => {
          onTabChange(newValue)
        }}
        showLabels
        sx={{
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.75rem',
            fontWeight: 500,
          },
        }}
      >
        <BottomNavigationAction
          label="Dashboard"
          icon={<DashboardIcon />}
          value="dashboard"
        />
        <BottomNavigationAction
          label="Add Trade"
          icon={<AddIcon />}
          value="add"
          onClick={onShowTradeForm}
        />
        <BottomNavigationAction
          label="Trades"
          icon={<ListIcon />}
          value="trades"
        />
        <BottomNavigationAction
          label="Profile"
          icon={<PersonIcon />}
          value="profile"
          onClick={onShowUserManagement}
        />
        <BottomNavigationAction
          label="Tools"
          icon={<SettingsIcon />}
          value="tools"
          onClick={onShowTools}
        />
      </BottomNavigation>
    </Paper>
  )
}
