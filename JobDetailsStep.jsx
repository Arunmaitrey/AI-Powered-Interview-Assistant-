import React from 'react';
import { 
  Typography, Box, Paper, TextField, MenuItem 
} from '@mui/material';

const JobDetailsStep = ({ 
  selectedPreparation, 
  selectedJobRole, 
  setSelectedJobRole, 
  jobRoleSearch, 
  setJobRoleSearch,
  selectedCompanyName,
  setSelectedCompanyName,
  companyNameSearch,
  setCompanyNameSearch,
  jobDescription,
  setJobDescription,
  jobRoles,
  companyNames
}) => {
  const filteredJobRoles = jobRoles.filter(role => 
    role.toLowerCase().includes(jobRoleSearch.toLowerCase())
  );

  const filteredCompanyNames = companyNames.filter(company => 
    company.toLowerCase().includes(companyNameSearch.toLowerCase())
  );

  const getStepTitle = () => {
    if (selectedPreparation === 'resume') {
      return 'You are preparing for a role without focusing on any particular company.';
    } else if (selectedPreparation === 'job-description') {
      return 'Select job profile details for the interview';
    } else if (selectedPreparation === 'combined') {
      return 'Select job profile details for the interview';
    }
    return 'Select Difficulty Level';
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
        {getStepTitle()}
      </Typography>
      
      {/* Job Role Selection - Show for all preparation types */}
      {(selectedPreparation === 'resume' || selectedPreparation === 'job-description' || selectedPreparation === 'combined') && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 2 }}>
            Select Job Role
          </Typography>
          <TextField
            select
            fullWidth
            value={selectedJobRole}
            variant="outlined"
            onChange={(e) => setSelectedJobRole(e.target.value)}
            SelectProps={{
              displayEmpty: true,
              renderValue: (value) => value || "Select a job role",
              MenuProps: {
                PaperProps: {
                  sx: {
                    maxHeight: 300,
                    '& .MuiMenuItem-root': {
                      padding: '12px 16px',
                    }
                  }
                },
                onClose: (event) => {
                  if (event.target.closest('[data-search-box="true"]')) {
                    event.preventDefault();
                  }
                },
                disableAutoFocus: true,
                disableRestoreFocus: true
              },
              onOpen: () => {
                setJobRoleSearch('');
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderColor: '#e0e0e0',
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                  borderWidth: 2,
                },
              },
            }}
          >
            <Box 
              data-search-box="true"
              sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}
              onClick={(e) => e.stopPropagation()}
            >
              <TextField
                fullWidth
                placeholder="Search job roles..."
                variant="outlined"
                size="small"
                value={jobRoleSearch}
                onChange={(e) => setJobRoleSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderColor: '#e0e0e0',
                    borderRadius: 1,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                    },
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '14px',
                  },
                }}
              />
            </Box>
            {filteredJobRoles.length > 0 ? (
              filteredJobRoles.map((role) => (
                <MenuItem key={role} value={role} sx={{ py: 1 }}>
                  {role}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>
                No job roles found matching "{jobRoleSearch}"
              </MenuItem>
            )}
          </TextField>
        </Box>
      )}

      {/* Company Name Selection - Show for job-description and combined */}
      {(selectedPreparation === 'job-description' || selectedPreparation === 'combined') && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 2 }}>
            Company Name
          </Typography>
          <TextField
            select
            fullWidth
            value={selectedCompanyName}
            variant="outlined"
            onChange={(e) => setSelectedCompanyName(e.target.value)}
            SelectProps={{
              displayEmpty: true,
              renderValue: (value) => value || "Select a company",
              MenuProps: {
                PaperProps: {
                  sx: {
                    maxHeight: 300,
                    '& .MuiMenuItem-root': {
                      padding: '12px 16px',
                    }
                  }
                },
                onClose: (event) => {
                  if (event.target.closest('[data-search-box="true"]')) {
                    event.preventDefault();
                  }
                },
                disableAutoFocus: true,
                disableRestoreFocus: true
              },
              onOpen: () => {
                setCompanyNameSearch('');
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderColor: '#e0e0e0',
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                  borderWidth: 2,
                },
              },
            }}
          >
            <Box 
              data-search-box="true"
              sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}
              onClick={(e) => e.stopPropagation()}
            >
              <TextField
                fullWidth
                placeholder="Search companies..."
                variant="outlined"
                size="small"
                value={companyNameSearch}
                onChange={(e) => setCompanyNameSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderColor: '#e0e0e0',
                    borderRadius: 1,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                    },
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '14px',
                  },
                }}
              />
            </Box>
            {filteredCompanyNames.length > 0 ? (
              filteredCompanyNames.map((company) => (
                <MenuItem key={company} value={company} sx={{ py: 1 }}>
                  {company}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>
                No companies found matching "{companyNameSearch}"
              </MenuItem>
            )}
          </TextField>
        </Box>
      )}

      {/* Job Description - Show for job-description and combined */}
      {(selectedPreparation === 'job-description' || selectedPreparation === 'combined') && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 2 }}>
            Job Description
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            placeholder="Paste or type the job description here..."
            variant="outlined"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderColor: '#e0e0e0',
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                  borderWidth: 2,
                },
              },
            }}
          />
          <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
            This will help us generate more relevant interview questions tailored to the specific role.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default JobDetailsStep;
