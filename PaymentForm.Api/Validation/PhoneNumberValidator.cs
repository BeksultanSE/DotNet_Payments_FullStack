using PhoneNumbers;

namespace PaymentForm.Api.Validation;

public static class PhoneNumberValidator
{
    private static readonly PhoneNumberUtil Util =
        PhoneNumberUtil.GetInstance();

    public static bool IsValid(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return false;

        try
        {
            var number = Util.Parse(phone, null);

            return Util.IsValidNumber(number);
        }
        catch (NumberParseException)
        {
            return false;
        }
    }

    public static string Normalize(string phone)
    {
        var number = Util.Parse(phone, null);

        return Util.Format(
            number,
            PhoneNumberFormat.E164
        );
    }
}