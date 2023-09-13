import {
  DatePicker,
  DatePickerInput,
  Dropdown,
  Form,
  NumberInput,
  RadioButton,
  RadioButtonGroup,
  Select,
  SelectItem,
} from '@carbon/react';
import React from 'react';

const regimen = [
  { id: '165330', name: 'ATV/r+TDF+3TC+DTG' },
  { id: '1703', name: 'AZT+3TC+EFV' },
  { id: '6100', name: 'AZT+3TC+LPV/r' },
  { id: '1651', name: 'AZT+3TC+NVP' },
  { id: '6324', name: 'TDF+3TC+EFV' },
  { id: '6243', name: 'TDF+3TC+NVP' },
  { id: '6104', name: 'ABC+3TC+EFV' },
  { id: '23784', name: 'TDF+3TC+DTG' },
  { id: '23786', name: 'ABC+3TC+DTG' },
  { id: '6116', name: 'AZT+3TC+ABC' },
  { id: '6106', name: 'ABC+3TC+LPV/r' },
  { id: '6105', name: 'ABC+3TC+NVP' },
  { id: '6424', name: 'TDF+3TC+LPV/r' },
  { id: '23790', name: 'TDF+3TC+LPV/r+RTV' },
  { id: '23791', name: 'TDF+3TC+ATV/r' },
  { id: '23792', name: 'ABC+3TC+ATV/r' },
  { id: '23793', name: 'AZT+3TC+ATV/r' },
  { id: '23795', name: 'ABC+3TC+ATV/r+RAL' },
  { id: '23796', name: 'TDF+3TC+ATV/r+RAL' },
  { id: '23801', name: 'AZT+3TC+RAL' },
  { id: '23802', name: 'AZT+3TC+DRV/r' },
  { id: '23815', name: 'AZT+3TC+DTG' },
  { id: '6329', name: 'TDF+3TC+RAL+DRV/r' },
  { id: '23797', name: 'ABC+3TC+RAL+DRV/r' },
  { id: '23798', name: '3TC+RAL+DRV/r' },
  { id: '23803', name: 'AZT+3TC+RAL+DRV/r' },
  { id: '165261', name: 'TDF+3TC+RAL' },
  { id: '165262', name: 'ABC+3TC+RAL' },
  { id: '165215', name: 'TDF+FTC PreEP' },
  { id: '23789', name: 'TDF+AZT+LPV/r' },
  { id: '23787', name: 'ABC+AZT+LPV/r' },
  { id: '6326', name: 'ABC+AZT+3TC+LPV/r' },
  { id: '6234', name: 'TDF+ABC+LPV/r' },
  { id: '23788', name: 'TDF+ABC+3TC+LPV/r' },
  { id: '6107', name: 'TDF+AZT+3TC+LPV/r' },
  { id: '5424', name: 'OUTRO' },
];

const posology = ['1-0-1', '0-0-1', '1-0-0', '2-0-2', '3-0-3', '0-0-3', '1-0-2', '1-0-1.5', 'Outra'];

const dispensingMode = [
  { uuid: '4b51ace2-f778-4f54-bdaa-be2b350b7499', name: 'Horário Normal de Expediente' },
  { uuid: '1309d08a-5c73-4429-8f4b-43a551952858', name: 'Fora do Horário' },
  { uuid: 'd2eaec39-9c48-443b-a8d5-b2b163d42c53', name: 'FARMAC/Farmácia privada' },
  { uuid: '870e2d25-c5ef-4e36-89db-0a4a37af214e', name: 'Dispensa Comunitária via Provedor' },
  { uuid: '0843c71b-be47-4de2-ba16-a08db52c1136', name: 'Dispensa Comunitária via APE' },
  { uuid: '3ab58d0e-f831-4966-97bd-209738f5e4df', name: 'Brigadas Móveis Diurnas' },
  { uuid: 'd6ad74a1-ff67-4b81-afa1-a0d906462623', name: 'Brigadas Móveis Nocturnas (Hotspots)' },
  { uuid: '467718bc-1756-4b3f-b1ee-98d01910153a', name: 'Clínicas Móveis Diurnas' },
  { uuid: '091737af-d6bf-4830-8e87-82572ffac9ea', name: 'Clínicas Móveis Nocturnas (Hotspots)' },
];

export default function Fila() {
  return (
    <Form>
      <h4>{'Ficha Individual de Levantamento de ARVs (FILA)'}</h4>
      <DatePicker datePickerType="single">
        <DatePickerInput id="pickup-date" placeholder="mm/dd/yyyy" labelText="* Data de Levantamento" size="md" />
      </DatePicker>
      <Dropdown
        id="provider"
        titleText="* Provedor"
        label=""
        items={[{ text: 'Default Provider' }]}
        itemToString={(item) => (item ? item.text : '')}
      />
      <Dropdown
        id="us"
        titleText="* Unidade Sanitária"
        label=""
        items={[{ text: 'CS 24 de Julho' }]}
        itemToString={(item) => (item ? item.text : '')}
      />

      <Select id="regimen" labelText="* Regime ARVs">
        <SelectItem value="" text="" />
        {regimen.map((r) => (
          <SelectItem key={r.id} value={r.id} text={r.name} />
        ))}
      </Select>

      <Select id="formulation" labelText="Formulação">
        <SelectItem value="" text="" />
      </Select>

      <NumberInput id="quantity" label="Quantidade" />

      <Select id="dosage" labelText="Dosagem">
        <SelectItem value="" text="" />
        {posology.map((p) => (
          <SelectItem key={p} value={p} text={p} />
        ))}
      </Select>

      <DatePicker datePickerType="single">
        <DatePickerInput
          id="next-pickup-date"
          placeholder="mm/dd/yyyy"
          labelText="* Data do próximo Levantamento"
          size="md"
        />
      </DatePicker>
      <RadioButtonGroup legendText="Levantamento efectuado num campo de acomodação?" name="radio-button-group">
        <RadioButton labelText="Sim" value="1065" id="yes" />
        <RadioButton labelText="Não" value="1066" id="no" />
      </RadioButtonGroup>
      <NumberInput id="field-number" label="Qual é o número do campo?" />
      <Select id="dispensation-mode" labelText="Modo de Dispensa">
        <SelectItem value="" text="" />
        {dispensingMode.map((d) => (
          <SelectItem key={d.uuid} value={d.uuid} text={d.name} />
        ))}
      </Select>
    </Form>
  );
}
