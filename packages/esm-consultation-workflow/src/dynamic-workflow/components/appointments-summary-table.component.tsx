import React, { useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
import { useTranslation } from 'react-i18next';
import { PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { formatDatetime, parseDate, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { Appointment } from '../resources/patient-appointments.resource';
import { ApppointmentsActionMenu } from './appointments-step-renderer.component';
import {
  DataTable,
  type DataTableHeader,
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';

const pageSize = 10;

interface AppointmentSummaryTableProps {
  appointments: Array<Appointment>;
  patientUuid: string;
  mutate: () => void;
}

const AppointmentsSummaryTable: React.FC<AppointmentSummaryTableProps> = ({ appointments, patientUuid, mutate }) => {
  const { t } = useTranslation();
  const { results: paginatedAppointments, currentPage, goTo } = usePagination(appointments, pageSize);
  const isTablet = useLayoutType() === 'tablet';

  const tableHeaders: Array<typeof DataTableHeader> = useMemo(
    () => [
      { key: 'date', header: t('date', 'Date') },
      { key: 'location', header: t('location', 'Location') },
      { key: 'service', header: t('service', 'Service') },
      { key: 'status', header: t('status', 'Status') },
      { key: 'type', header: t('type', 'Type') },
      { key: 'notes', header: t('notes', 'Notes') },
    ],
    [t],
  );

  const tableRows = useMemo(
    () =>
      paginatedAppointments?.map((appointment) => {
        return {
          id: appointment.uuid,
          date: formatDatetime(parseDate(appointment.startDateTime), { mode: 'wide' }),
          location: appointment?.location?.name ? appointment?.location?.name : '——',
          service: appointment.service.name,
          status: appointment.status,
          type: appointment.appointmentKind ? appointment.appointmentKind : '——',
          notes: appointment.comments ? appointment.comments : '——',
        };
      }),
    [paginatedAppointments],
  );

  return (
    <div>
      <DataTable rows={tableRows} headers={tableHeaders} isSortable size={isTablet ? 'lg' : 'sm'} useZebraStyles>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <TableContainer>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
                      {...getHeaderProps({
                        header,
                        isSortable: header.isSortable,
                      })}>
                      {header.header?.content ?? header.header}
                    </TableHeader>
                  ))}
                  <TableHeader />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={row.id}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                    ))}
                    <TableCell className="cds--table-column-menu">
                      <ApppointmentsActionMenu
                        appointment={paginatedAppointments[i]}
                        patientUuid={patientUuid}
                        mutate={mutate}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
      <PatientChartPagination
        currentItems={paginatedAppointments.length}
        totalItems={appointments.length}
        onPageNumberChange={({ page }) => goTo(page)}
        pageNumber={currentPage}
        pageSize={pageSize}
      />
    </div>
  );
};

export default AppointmentsSummaryTable;
