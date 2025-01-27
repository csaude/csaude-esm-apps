import { render } from '@testing-library/react';
import React from 'react';
import { Wizard } from 'react-use-wizard';
import Obs from '../form/obs.component';
import RastreioItsStep from './rastreio-its-step.component';

jest.mock('../form/obs.component');

describe('RastreioItsStep', () => {
  it('should render', () => {
    const values = {
      stiScreening: '',
      sti: '',
    };
    const setValues = jest.fn();
    render(
      <Wizard>
        <RastreioItsStep values={values} setValues={setValues} />
      </Wizard>,
    );
    expect(Obs).toHaveBeenCalledWith(expect.objectContaining({ name: 'stiScreening' }), expect.anything());
    expect(Obs).toHaveBeenCalledWith(expect.objectContaining({ name: 'sti' }), expect.anything());
  });
});
