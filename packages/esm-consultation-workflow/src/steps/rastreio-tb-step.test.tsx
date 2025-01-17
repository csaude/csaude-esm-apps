import { render } from '@testing-library/react';
import React from 'react';
import { Wizard } from 'react-use-wizard';
import Obs from '../form/obs.component';
import RastreioTbStep from './rastreio-tb-step.component';

jest.mock('../form/obs.component');

describe('RastreioTbStep', () => {
  it('should render', () => {
    const values = {
      tbObservations: '',
      tbSymptoms: '',
    };
    const setValues = jest.fn();
    render(
      <Wizard>
        <RastreioTbStep values={values} setValues={setValues} />
      </Wizard>,
    );
    expect(Obs).toHaveBeenCalledWith(expect.objectContaining({ name: 'tbObservations' }), expect.anything());
    expect(Obs).toHaveBeenCalledWith(expect.objectContaining({ name: 'tbSymptoms' }), expect.anything());
  });
});
