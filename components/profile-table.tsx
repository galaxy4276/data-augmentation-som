'use client';

import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExportDialog } from '@/components/export-dialog';
import type { ProfileData, ProfileSummary, DatasetType, ProfileFilters } from '@/types/api';

interface ProfileTableProps {
  profiles: ProfileSummary[];
  isLoading?: boolean;
  onProfileClick?: (profile: ProfileSummary) => void;
  currentPage: number;
  totalPages: number;
  totalProfiles?: number;
  onPageChange: (page: number) => void;
  datasetType?: DatasetType;
  filters?: Partial<ProfileFilters>;
}

export function ProfileTable({
  profiles,
  isLoading,
  onProfileClick,
  currentPage,
  totalPages,
  totalProfiles,
  onPageChange,
  datasetType,
  filters,
}: ProfileTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<ProfileSummary>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="hover:bg-transparent"
            >
              Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return (
            <div className="font-medium">{row.original.name}</div>
          );
        },
      },
      {
        accessorKey: 'age',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="hover:bg-transparent"
            >
              Age
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return <div>{row.original.age}</div>;
        },
      },
      {
        accessorKey: 'gender',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="hover:bg-transparent"
            >
              Gender
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const gender = row.original.gender;
          return (
            <Badge variant={gender === 'MALE' ? 'default' : 'secondary'}>
              {gender}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'mbti',
        header: 'MBTI',
        cell: ({ row }) => {
          return (
            <Badge variant="outline">{row.original.mbti}</Badge>
          );
        },
      },
      {
        accessorKey: 'dataset_type',
        header: 'Dataset Type',
        cell: ({ row }) => {
          const type = row.original.dataset_type;
          return (
            <Badge variant={type === 'validation' ? 'default' : 'secondary'}>
              {type}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'image_count',
        header: 'Images',
        cell: ({ row }) => {
          const imageCount = row.original.image_count;
          return (
            <div className="text-center">
              <span className="text-sm font-medium">{imageCount}</span>
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: profiles,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    manualPagination: true,
    pageCount: totalPages,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading profiles...</div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">
            No profiles found
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your filters or generate new data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar with Export Button */}
      {datasetType && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {totalProfiles !== undefined && `${totalProfiles} profiles`}
          </div>
          <ExportDialog
            datasetType={datasetType}
            filters={filters}
            totalProfiles={totalProfiles}
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => onProfileClick?.(row.original)}
                className="cursor-pointer hover:bg-muted/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
