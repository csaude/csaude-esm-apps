import { render } from '@testing-library/react';
import React from 'react';
import { Wizard } from 'react-use-wizard';
import Obs from '../form/obs.component';
import PregnancyStep from './pregnancy-step.component';

jest.mock('../form/obs.component');

describe('RastreioTbStep', () => {
  it('should render', () => {
    const values = {
      pregnancy: '',
      lastMenstruationDate: new Date(),
      lactating: '',
      birthControl: [],
      otherBirthControl: '',
    };
    const setValues = jest.fn();
    render(
      <Wizard>
        <PregnancyStep values={values} setValues={setValues} />
      </Wizard>,
    );
    expect(Obs).toHaveBeenCalledWith(expect.objectContaining({ name: 'pregnancy' }), expect.anything());
    expect(Obs).toHaveBeenCalledWith(expect.objectContaining({ name: 'lactating' }), expect.anything());
    expect(Obs).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'lastMenstruationDate', hide: expect.any(Function) }),
      expect.anything(),
    );
    expect(Obs).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'birthControl', hide: expect.any(Function) }),
      expect.anything(),
    );
    expect(Obs).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'otherBirthControl', hide: expect.any(Function) }),
      expect.anything(),
    );
  });
});
