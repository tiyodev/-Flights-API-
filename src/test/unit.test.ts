import { isValidDate, isValidDateTime, isFirstDateIsAfterSecondDate } from '../api/v1/common/tools/validation';

describe('Test validation date', () => {
  it(`should return true for '1991-10-12'`, async () => {
    const result = isValidDate('1991-10-12');
    expect(result).toEqual(true);
  });
  it(`should return false for '199dsc1-10-12'`, async () => {
    const result = isValidDate('199dsc1-10-12');
    expect(result).toEqual(false);
  });
});

describe('Test validation dateTime', () => {
  it(`should return true for '1991-10-12T12:10'`, async () => {
    const result = isValidDateTime('1991-10-12T12:10');
    expect(result).toEqual(true);
  });
  it(`should return false for '1991-10-12T12:105'`, async () => {
    const result = isValidDateTime('1991-10-12T12:105');
    expect(result).toEqual(false);
  });
});

describe('Test if first date is after second date', () => {
  it(`should return true for first date = '1991-10-12' and second date = 1991-10-16`, async () => {
    const result = isFirstDateIsAfterSecondDate(new Date('1991-10-12'), new Date('1991-10-16'));
    expect(result).toEqual(true);
  });
  it(`should return true for first date = '1991-10-12' and second date = 1991-10-09`, async () => {
    const result = isFirstDateIsAfterSecondDate(new Date('1991-10-12'), new Date('1991-10-09'));
    expect(result).toEqual(false);
  });
});
