import { render } from '@testing-library/react';
import React from 'react';
import { Wizard } from 'react-use-wizard';
import Obs from '../form/obs.component';
import AvaliacaoDeAdesaoStep from './avaliacao-de-adesao-step.component';

jest.mock('../form/obs.component');

describe('AvaliacaoNutricionalStep', () => {
  it('should render', () => {
    const values = {
      adherence: '',
      arvSideEffects: [],
      inhSideEffect: '',
      ctzSideEffect: '',
    };
    const setValues = jest.fn();
    render(
      <Wizard>
        <AvaliacaoDeAdesaoStep values={values} setValues={setValues} />
      </Wizard>,
    );
    expect(Obs).toHaveBeenCalledWith(expect.objectContaining({ name: 'adherence' }), expect.anything());
    expect(Obs).toHaveBeenCalledWith(expect.objectContaining({ name: 'arvSideEffects' }), expect.anything());
    expect(Obs).toHaveBeenCalledWith(expect.objectContaining({ name: 'inhSideEffect' }), expect.anything());
    expect(Obs).toHaveBeenCalledWith(expect.objectContaining({ name: 'ctzSideEffect' }), expect.anything());
  });
});
