/**
 * Extracts a patient's NID (National Identification Number) from the patient display string.
 * The NID is assumed to be the first part of the display string before any space or dash.
 *
 * @param patientDisplay - The patient display string from which to extract the NID
 * @returns The extracted NID or 'Unknown' if it cannot be extracted
 */
export function extractNID(patientDisplay: string): string {
  if (!patientDisplay) {
    return 'Unknown';
  }

  const nidMatch = patientDisplay.match(/^([^\s-]+)/);
  return nidMatch ? nidMatch[1] : 'Unknown';
}
