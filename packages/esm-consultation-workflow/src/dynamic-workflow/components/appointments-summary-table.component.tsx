import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDatetime, parseDate } from '@openmrs/esm-framework';
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
interface AppointmentSummaryTableProps {
  appointments: Array<Appointment>;
  patientUuid: string;
  isTablet: boolean;
}

const AppointmentsSummaryTable: React.FC<AppointmentSummaryTableProps> = ({ appointments, isTablet, patientUuid }) => {
  const { t } = useTranslation();

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
      appointments?.map((appointment) => {
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
    [appointments],
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
                      <ApppointmentsActionMenu appointment={appointments[i]} patientUuid={patientUuid} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

export default AppointmentsSummaryTable;
