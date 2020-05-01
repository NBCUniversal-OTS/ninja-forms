const nfLocaleConverter = require('../nfLocaleConverter');

test('locale decode zero', () => {
    let nfConverter = new nfLocaleConverter();

    expect(nfConverter.numberDecoder("0")).toBe("0");
});

test('locale decode integer', () => {
    let nfConverter = new nfLocaleConverter();

    expect(nfConverter.numberDecoder("1234")).toBe("1234");
});

test('locale decode with comma thousands and period decimal', () => {
    let nfConverter = new nfLocaleConverter();

    expect(nfConverter.numberDecoder("1,234.56")).toBe("1234.56");
});

test('locale decode with period thousands and comma decimal', () => {
    let nfConverter = new nfLocaleConverter();

    expect(nfConverter.numberDecoder("1.234,56")).toBe("1234.56");
});

test('locale decode negative integer', () => {
    let nfConverter = new nfLocaleConverter();

    expect(nfConverter.numberDecoder("-1234")).toBe("-1234");
});

test('locale decode negative float', () => {
    let nfConverter = new nfLocaleConverter();

    expect(nfConverter.numberDecoder("-1234.56")).toBe("-1234.56");
});

test('locale decode only period thousands', () => {
    let nfConverter = new nfLocaleConverter();
    nfConverter.thousands_sep = '.';

    expect(nfConverter.numberDecoder("123.456")).toBe("123456");
});

test('locale decode only space thousands', () => {
    let nfConverter = new nfLocaleConverter();
    nfConverter.thousands_sep = ' ';

    expect(nfConverter.numberDecoder("123 456")).toBe("123456");
});

test('locale decode only non-breaking space thousands', () => {
    let nfConverter = new nfLocaleConverter();
    nfConverter.thousands_sep = '&nbsp;';

    expect(nfConverter.numberDecoder("123&nbsp;456")).toBe("123456");
});

test('get normal version of 123,456', () => {
    let nfConverter = new nfLocaleConverter();

    expect(nfConverter.numberDecoder("123,456")).toBe("123456");
});

test('get normal version of 123,456,789', () => {
    let nfConverter = new nfLocaleConverter();

    expect(nfConverter.numberDecoder("123,456,789")).toBe("123456789");
});

test('get FR version of 123456.233', () => {
    let nfConverter = new nfLocaleConverter();

    expect(nfConverter.numberDecoder("123 456,233")).toBe('123456.233');
});

test('get In version of 123456.233', () => {
    let nfConverter = new nfLocaleConverter();

    expect(nfConverter.numberDecoder("1,23,456.233")).toBe('123456.233');
});

test('get In version of 123456.233', () => {
    let nfConverter = new nfLocaleConverter();

    expect(nfConverter.numberDecoder("1.234.456,233")).toBe('1234456.233');
});

test('encode integer', () => {
    let nfConverter = new nfLocaleConverter();

    expect(nfConverter.numberEncoder("1234")).toBe('1,234');
});

test('encode negative integer', () => {
    let nfConverter = new nfLocaleConverter();

    expect(nfConverter.numberEncoder("-1234")).toBe('-1,234');
});

test('encode negative float', () => {
    let nfConverter = new nfLocaleConverter();

    expect(nfConverter.numberEncoder("-1234.56")).toBe('-1,234.56');
});

test('encode bad format', () => {
    let nfConverter = new nfLocaleConverter();

    expect(nfConverter.numberEncoder("$1234.56")).toBe('NaN');
});

test('encode period thousands and comma decimal', () => {
    let nfConverter = new nfLocaleConverter();
    nfConverter.locale = 'es';

    expect(nfConverter.numberEncoder("1234.56")).toBe('1.234,56');
});

test('convert French to US', () => {
    let nfConverter = new nfLocaleConverter();

    expect(nfConverter.numberEncoder("123 456,233")).toBe("123,456.233");
});

test('convert French with nbsp to US', () => {
    let nfConverter = new nfLocaleConverter();

    expect(nfConverter.numberEncoder("123&nbsp;456,233")).toBe("123,456.233");
});

test('convert US to French', () => {
    let nfConverter = new nfLocaleConverter('fr');

    expect(nfConverter.numberEncoder("123,456.789").replace(/\s/g, ' ')).toBe("123 456,789");
});

test('convert US to French with big number', () => {
    let nfConverter = new nfLocaleConverter('fr');
    
    //replace spaces with a normal space b/c numberEncoder use 'thin spaces' for French thousands separator
    expect(nfConverter.numberEncoder("123,456,789.123").replace(/\s/g, ' ')).toBe("123 456 789,123");
});

test('convert US to Indian with big number', () => {
    let nfConverter = new nfLocaleConverter('hi-IN');

    expect(nfConverter.numberEncoder("123,456,789.123")).toBe("12,34,56,789.123");
});

test('convert French to Indian with big number', () => {
    let nfConverter = new nfLocaleConverter('hi-IN');

    expect(nfConverter.numberEncoder("123 456 789,123")).toBe("12,34,56,789.123");
});

test('convert Indian to French with big number', () => {
    let nfConverter = new nfLocaleConverter('fr');

    expect(nfConverter.numberEncoder("12,34,56,789.123").replace(/\s/g, ' ')).toBe("123 456 789,123");
});