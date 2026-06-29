"use client";

import { Container, Stack } from "@mui/material";
import { useState } from "react";
import { mockInvoices } from "./data";
import { InvoiceList } from "./components";

export default function InvoicePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [statusFilter, setStatusFilter] = useState("All status");

  // Filter invoices
  const getFilteredInvoices = () => {
    let filtered = mockInvoices;

    if (searchQuery) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          invoice.invoice.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== "All categories") {
      filtered = filtered.filter(
        (invoice) => invoice.category === categoryFilter
      );
    }

    if (statusFilter !== "All status") {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    return filtered;
  };

  const filteredInvoices = getFilteredInvoices();

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = filteredInvoices.map((invoice) => invoice.id);
      setSelectedRows(newSelected);
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const isAllSelected =
    filteredInvoices.length > 0 &&
    selectedRows.length === filteredInvoices.length;

  const isSomeSelected =
    selectedRows.length > 0 && selectedRows.length < filteredInvoices.length;

  const paginatedData = filteredInvoices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (

    <Stack spacing={3}>
      <InvoiceList
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        selectedRows={selectedRows}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
        isAllSelected={isAllSelected}
        isSomeSelected={isSomeSelected}
        filteredInvoices={filteredInvoices}
        paginatedData={paginatedData}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        onDeselect={() => setSelectedRows([])}
      />
    </Stack>

  );
}
