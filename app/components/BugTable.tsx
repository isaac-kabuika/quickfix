import { Chip, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

// ... existing imports ...

const ExpandedRow = ({ row }: { row: Bug }) => {
  const [isEditing, setIsEditing] = useState(false);

  const tasks = [
    { label: "Started app", done: true },
    { label: "Recorded bug session", done: true },
    { label: "Analyzed bug session", done: false },
    { label: "AI reproduced bug", done: false },
    { label: "AI drafted fix", done: false },
    { label: "AI tested fix", done: false },
    { label: "Submitted fix", done: false },
  ];

  return (
    <Box sx={{ display: 'flex', padding: 2 }}>
      <Box sx={{ flex: 1 }}>
        {isEditing ? (
          // ... existing edit form ...
        ) : (
          <Typography variant="body1">{row.description}</Typography>
        )}
      </Box>
      <Box sx={{ width: 200, marginLeft: 2 }}>
        {tasks.map((task, index) => (
          <Chip
            key={index}
            icon={<FiberManualRecordIcon sx={{ color: task.done ? 'green' : 'gray' }} />}
            label={task.label}
            sx={{
              backgroundColor: 'white',
              color: 'black',
              marginBottom: 1,
              width: '100%',
              justifyContent: 'flex-start',
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

const BugTable = ({ bugs }: { bugs: Bug[] }) => {
  // ... existing code ...

  const columns: GridColDef[] = [
    // ... other columns ...
    {
      field: 'description',
      headerName: 'Description',
      width: 300,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Typography variant="body2" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {params.value}
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              // Handle edit button click
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
    // ... other columns ...
  ];

  // ... rest of the component ...
};