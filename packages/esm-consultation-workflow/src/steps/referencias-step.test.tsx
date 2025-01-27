import { render } from '@testing-library/react';
import React from 'react';
import { Wizard } from 'react-use-wizard';
import Obs from '../form/obs.component';
import ReferenciasStep from './referencias-step.component';

jest.mock('../form/obs.component');

describe('ReferenciasStep', () => {
  it('should render', () => {
    const values = {
      referralsOrdered: '',
      otherReferral: '',
      eligibleSupportGroup: '',
      reveletedChildren: '',
      fathersAndCaregivers: '',
      reveletedAdolescents: '',
      motherToMother: '',
      mentoringMother: '',
      youthAndTeenageMenthor: '',
      championMan: '',
      otherSupportGroup: '',
    };
    const setValues = jest.fn();
    render(
      <Wizard>
        <ReferenciasStep values={values} setValues={setValues} />
      </Wizard>,
    );
    expect(Obs).toHaveBeenCalledWith(expect.objectContaining({ name: 'referralsOrdered' }), expect.anything());
    expect(Obs).toHaveBeenCalledWith(expect.objectContaining({ name: 'otherReferral' }), expect.anything());
    expect(Obs).toHaveBeenCalledWith(expect.objectContaining({ name: 'eligibleSupportGroup' }), expect.anything());
    expect(Obs).toHaveBeenCalledWith(expect.objectContaining({ name: 'reveletedChildren' }), expect.anything());
    expect(Obs).toHaveBeenCalledWith(expect.objectContaining({ name: 'fathersAndCaregivers' }), expect.anything());
    expect(Obs).toHaveBeenCalledWith(expect.objectContaining({ name: 'reveletedAdolescents' }), expect.anything());
    expect(Obs).toHaveBeenCalledWith(expect.objectContaining({ name: 'motherToMother' }), expect.anything());
    expect(Obs).toHaveBeenCalledWith(expect.objectContaining({ name: 'mentoringMother' }), expect.anything());
    expect(Obs).toHaveBeenCalledWith(expect.objectContaining({ name: 'youthAndTeenageMenthor' }), expect.anything());
    expect(Obs).toHaveBeenCalledWith(expect.objectContaining({ name: 'championMan' }), expect.anything());
    expect(Obs).toHaveBeenCalledWith(expect.objectContaining({ name: 'otherSupportGroup' }), expect.anything());
  });
});
