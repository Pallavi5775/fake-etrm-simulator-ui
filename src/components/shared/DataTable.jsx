import { useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, TableSortLabel, TextField, Box, IconButton
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

/**
 * Reusable data table component with sorting, filtering, and pagination
 */
export default function DataTable({
  columns,
  rows,
  defaultSortBy = "",
  defaultSortDirection = "asc",
  pageSize = 10,
  onRowClick = null,
  enableFilter = true,
  sx = {}
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [sortDirection, setSortDirection] = useState(defaultSortDirection);
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const handleSort = (field) => {
    const isAsc = sortBy === field && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortBy(field);
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
    setPage(0); // Reset to first page when filtering
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Apply filters
  const filteredRows = rows.filter(row => {
    return Object.keys(filters).every(field => {
      const filterValue = filters[field]?.toLowerCase() || "";
      if (!filterValue) return true;
      const cellValue = String(row[field] || "").toLowerCase();
      return cellValue.includes(filterValue);
    });
  });

  // Apply sorting
  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!sortBy) return 0;
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Apply pagination
  const paginatedRows = sortedRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper sx={{ width: "100%", ...sx }}>
      {enableFilter && (
        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
          <IconButton onClick={() => setShowFilters(!showFilters)}>
            <FilterListIcon />
          </IconButton>
        </Box>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            {showFilters && (
              <TableRow>
                {columns?.map(col => (
                  <TableCell key={`filter-${col.field}`}>
                    {col.filterable !== false && (
                      <TextField
                        size="small"
                        placeholder={`Filter ${col.label}`}
                        value={filters[col.field] || ""}
                        onChange={e => handleFilterChange(col.field, e.target.value)}
                        fullWidth
                      />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            )}
            <TableRow>
              {columns?.map(col => (
                <TableCell key={col.field}>
                  {col.sortable !== false ? (
                    <TableSortLabel
                      active={sortBy === col.field}
                      direction={sortBy === col.field ? sortDirection : "asc"}
                      onClick={() => handleSort(col.field)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows?.map((row, idx) => (
                <TableRow
                  key={row.id || idx}
                  hover
                  onClick={() => onRowClick && onRowClick(row)}
                  sx={{ cursor: onRowClick ? "pointer" : "default" }}
                >
                  {columns?.map(col => (
                    <TableCell key={col.field}>
                      {col.render ? col.render(row[col.field], row) : row[col.field]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
