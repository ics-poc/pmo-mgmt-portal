// src/components/CandidateUpload.jsx

import React, { useState } from 'react';

import {

  Box,

  Typography,

  Paper,

  Grid,

  Button,

  Chip,

  Table,

  TableHead,

  TableRow,

  TableCell,

  TableBody,

  Divider

} from '@mui/material';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import DescriptionIcon from '@mui/icons-material/Description';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
 
const UploadBox = ({ title, accept, file, setFile, fileTypeHint, icon }) => {

  const handleFileChange = (e) => {

    if (e.target.files && e.target.files[0]) {

      setFile(e.target.files[0]);

    }

  };
 
  const handleDrop = (e) => {

    e.preventDefault();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {

      setFile(e.dataTransfer.files[0]);

    }

  };
 
  return (
<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
<Typography variant="subtitle2" fontWeight="700" color="text.secondary">

        {title}
</Typography>
<Paper

        elevation={0}

        onDragOver={(e) => e.preventDefault()}

        onDrop={handleDrop}

        sx={{

          border: '2px dashed #90caf9',

          borderRadius: 2,

          bgcolor: '#f8fbff',

          display: 'flex',

          flexDirection: 'column',

          alignItems: 'center',

          justifyContent: 'center',

          p: 2,

          textAlign: 'center',

          transition: 'all 0.2s',

          cursor: 'pointer',

          minHeight: '120px', // Dramatically reduced height

          '&:hover': {

            borderColor: 'primary.main',

            bgcolor: '#e3f2fd'

          }

        }}

        onClick={() => document.getElementById(`file-input-${title}`).click()}
>
<input

          id={`file-input-${title}`}

          type="file"

          accept={accept}

          style={{ display: 'none' }}

          onChange={handleFileChange}

        />

        {file ? (
<Box sx={{ textAlign: 'center' }}>
<DescriptionIcon sx={{ fontSize: 32, color: 'primary.main' }} />
<Typography variant="caption" display="block" sx={{ fontWeight: 600, mt: 0.5, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>

              {file.name}
</Typography>
<Chip 

              label="Selected" 

              color="success" 

              size="small" 

              sx={{ height: '18px', fontSize: '0.65rem' }}

              onDelete={(e) => { e.stopPropagation(); setFile(null); }} 

            />
</Box>

        ) : (
<>
<CloudUploadIcon sx={{ fontSize: 28, color: '#90caf9', mb: 0.5 }} />
<Typography variant="caption" fontWeight="600" color="text.primary">

              Drop {title}
</Typography>
<Chip label={fileTypeHint} size="small" sx={{ height: '16px', fontSize: '0.6rem', mt: 1 }} />
</>

        )}
</Paper>
</Box>

  );

};
 
const CandidateUpload = ({ onProcess }) => {

  const [brFile, setBrFile] = useState(null);

  const [cvFile, setCvFile] = useState(null);

  const [results, setResults] = useState(null);

  const [loading, setLoading] = useState(false);
 
  const handleProcessClick = async () => {

    if (!onProcess) return;

    setLoading(true);

    try {

      const response = await onProcess(brFile, cvFile);

      setResults(response);

    } catch (err) {

      console.error("Processing failed", err);

    } finally {

      setLoading(false);

    }

  };
 
  return (
<Box sx={{ maxWidth: "1400px", margin: "0 auto", p: 2 }}>

      {/* Header - Made more compact */}
<Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
<Box>
<Typography variant="h5" fontWeight="700" color="#1a237e">

            Shortlist Processor
</Typography>
<Typography variant="caption" color="text.secondary">

            Upload BR and CV ZIP files to begin analysis.
</Typography>
</Box>
<Button 

          variant="contained" 

          onClick={handleProcessClick} 

          disabled={!brFile || !cvFile || loading}

          endIcon={<PlayArrowIcon />}

          sx={{ height: '45px', px: 4, borderRadius: '8px' }}
>

          {loading ? "Processing..." : "Process Shortlist"}
</Button>
</Box>
 
      {/* Mini Upload Grid */}
<Grid container spacing={2} sx={{ mb: 4 }}>
<Grid item xs={12} sm={6} md={3}>
<UploadBox 

            title="BR Data" 

            accept=".zip" 

            file={brFile} 

            setFile={setBrFile} 

            fileTypeHint=".zip only" 

            icon={<DescriptionIcon />} 

          />
</Grid>
<Grid item xs={12} sm={6} md={3}>
<UploadBox 

            title="Candidate CVs" 

            accept=".zip" 

            file={cvFile} 

            setFile={setCvFile} 

            fileTypeHint=".zip only" 

            icon={<DescriptionIcon />} 

          />
</Grid>
</Grid>
 
      <Divider sx={{ mb: 4 }} />
 
      {/* RESULTS SECTION */}

      {results?.results?.map((br) => (
<Box key={br.br_id} sx={{ mb: 4 }}>
<Typography variant="subtitle1" fontWeight="700" sx={{ mb: 1, color: '#1a237e', display: 'flex', alignItems: 'center', gap: 1 }}>
<DescriptionIcon fontSize="small" /> BR Results: {br.br_id}
</Typography>
<Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
<Table size="small">
<TableHead sx={{ bgcolor: '#f5f5f5' }}>
<TableRow>
<TableCell sx={{ fontWeight: 'bold' }}>Rank</TableCell>
<TableCell sx={{ fontWeight: 'bold' }}>Resume ID</TableCell>
<TableCell sx={{ fontWeight: 'bold' }}>Final Score</TableCell>
<TableCell sx={{ fontWeight: 'bold' }}>Primary Skill</TableCell>
</TableRow>
</TableHead>
<TableBody>

                {[...br.matches]

                  .sort((a, b) => b.final_score - a.final_score)

                  .map((m, index) => (
<TableRow key={m.resume_id} hover>
<TableCell>{index + 1}</TableCell>
<TableCell sx={{ fontWeight: 500 }}>{m.resume_id}</TableCell>
<TableCell>
<Chip 

                          label={m.final_score.toFixed(2)} 

                          size="small" 

                          color={m.final_score > 0.7 ? "primary" : "default"}

                          variant="outlined"

                          sx={{ fontWeight: 700 }}

                        />
</TableCell>
<TableCell>

                        {m.primary_skill && m.primary_skill !== "None" ? (
<Chip label={m.primary_skill} size="small" variant="soft" />

                        ) : "N/A"}
</TableCell>
</TableRow>

                  ))}
</TableBody>
</Table>
</Paper>
</Box>

      ))}
 
      {!results && !loading && (
<Box sx={{ textAlign: 'center', py: 10, bgcolor: '#fafafa', borderRadius: 4, border: '1px dashed #ccc' }}>
<Typography color="text.secondary">

            Upload files and click "Process Shortlist" to view results here.
</Typography>
</Box>

      )}
</Box>

  );

};
 
export default CandidateUpload;
 