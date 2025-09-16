import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  IconButton
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'

const steps = ['Basic Info', 'Trade Details', 'Review']

export default function MobileTradeForm({ 
  open, 
  onClose, 
  onSubmit, 
  trade = null,
  isEdit = false 
}) {
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState({
    symbol: trade?.symbol || '',
    strategy: trade?.strategy || '',
    type: trade?.type || 'stock',
    entryDate: trade?.entryDate || new Date().toISOString().split('T')[0],
    entryPrice: trade?.entryPrice || '',
    quantity: trade?.quantity || '',
    notes: trade?.notes || '',
    option: trade?.option || {
      side: 'call',
      strike: '',
      expiration: ''
    }
  })

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleSubmit = () => {
    onSubmit(formData)
    onClose()
    setActiveStep(0)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleOptionChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      option: {
        ...prev.option,
        [field]: value
      }
    }))
  }

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Symbol"
                value={formData.symbol}
                onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Strategy"
                value={formData.strategy}
                onChange={(e) => handleInputChange('strategy', e.target.value)}
                placeholder="e.g., Long Call, Covered Call, Iron Condor"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                >
                  <MenuItem value="stock">Stock</MenuItem>
                  <MenuItem value="option">Option</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )
      
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Entry Date"
                type="date"
                value={formData.entryDate}
                onChange={(e) => handleInputChange('entryDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Entry Price"
                type="number"
                value={formData.entryPrice}
                onChange={(e) => handleInputChange('entryPrice', parseFloat(e.target.value) || '')}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || '')}
                required
              />
            </Grid>
            {formData.type === 'option' && (
              <>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Option Side</InputLabel>
                    <Select
                      value={formData.option.side}
                      onChange={(e) => handleOptionChange('side', e.target.value)}
                    >
                      <MenuItem value="call">Call</MenuItem>
                      <MenuItem value="put">Put</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Strike Price"
                    type="number"
                    value={formData.option.strike}
                    onChange={(e) => handleOptionChange('strike', parseFloat(e.target.value) || '')}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Expiration"
                    type="date"
                    value={formData.option.expiration}
                    onChange={(e) => handleOptionChange('expiration', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional notes about this trade..."
              />
            </Grid>
          </Grid>
        )
      
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Trade Details
            </Typography>
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
              <Typography><strong>Symbol:</strong> {formData.symbol}</Typography>
              <Typography><strong>Strategy:</strong> {formData.strategy}</Typography>
              <Typography><strong>Type:</strong> {formData.type}</Typography>
              <Typography><strong>Entry Date:</strong> {formData.entryDate}</Typography>
              <Typography><strong>Entry Price:</strong> ${formData.entryPrice}</Typography>
              <Typography><strong>Quantity:</strong> {formData.quantity}</Typography>
              {formData.type === 'option' && (
                <>
                  <Typography><strong>Option Side:</strong> {formData.option.side}</Typography>
                  <Typography><strong>Strike:</strong> ${formData.option.strike}</Typography>
                  <Typography><strong>Expiration:</strong> {formData.option.expiration}</Typography>
                </>
              )}
              {formData.notes && (
                <Typography><strong>Notes:</strong> {formData.notes}</Typography>
              )}
            </Box>
          </Box>
        )
      
      default:
        return null
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            {isEdit ? 'Edit Trade' : 'Add New Trade'}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {renderStepContent(activeStep)}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.symbol || !formData.entryPrice || !formData.quantity}
          >
            {isEdit ? 'Update Trade' : 'Add Trade'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={activeStep === 0 && (!formData.symbol || !formData.type)}
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
