import { render } from '@testing-library/react';
import React from 'react';
import { Wizard } from 'react-use-wizard';
import Obs from '../form/obs.component';
import AvaliacaoNutricionalStep from './avaliacao-nutricional-step.component';

jest.mock('../form/obs.component');

describe('AvaliacaoNutricionalStep', () => {
  it('should render', () => {
    const values = {
      indicator: '',
      classificationOfMalnutrition: '',
    };
    const setValues = jest.fn();
    render(
      <Wizard>
        <AvaliacaoNutricionalStep values={values} setValues={setValues} />
      </Wizard>,
    );
    expect(Obs).toHaveBeenCalledWith(expect.objectContaining({ name: 'indicator' }), expect.anything());
    expect(Obs).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'classificationOfMalnutrition' }),
      expect.anything(),
    );
  });
});
