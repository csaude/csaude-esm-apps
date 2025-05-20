import { extractNID } from './patient-utils';

describe('Patient Utilities', () => {
  describe('extractNID', () => {
    it('should extract NID from the beginning of a patient display string', () => {
      const patientDisplay = '12345/ABCDE - John Doe';
      expect(extractNID(patientDisplay)).toBe('12345/ABCDE');
    });

    it('should return "Unknown" if patient display is empty', () => {
      expect(extractNID('')).toBe('Unknown');
    });

    it('should return "Unknown" if patient display is null or undefined', () => {
      expect(extractNID(null as any)).toBe('Unknown');
      expect(extractNID(undefined as any)).toBe('Unknown');
    });

    it('should extract NID when there are no spaces or dashes', () => {
      const patientDisplay = '12345ABCDE';
      expect(extractNID(patientDisplay)).toBe('12345ABCDE');
    });

    it('should extract NID up to the first space', () => {
      const patientDisplay = '12345 John Doe';
      expect(extractNID(patientDisplay)).toBe('12345');
    });

    it('should extract NID up to the first dash', () => {
      const patientDisplay = '12345-John-Doe';
      expect(extractNID(patientDisplay)).toBe('12345');
    });
  });
});
