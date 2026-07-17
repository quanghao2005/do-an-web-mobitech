using System;
using System.Text.RegularExpressions;

class Program
{
    static void Main()
    {
        string query = ""cho tôi xem s?n ph?m t? 20-30tr"";
        string pattern = @""(?:t?\s*)?(\d+)\s*(?:d?n|-)\s*(\d+)\s*(tr|tri?u|t)"";
        Match m = Regex.Match(query, pattern, RegexOptions.IgnoreCase);
        if (m.Success)
        {
            Console.WriteLine(""Matched!"");
            Console.WriteLine(""Group 1: "" + m.Groups[1].Value);
            Console.WriteLine(""Group 2: "" + m.Groups[2].Value);
        }
        else
        {
            Console.WriteLine(""No match."");
        }
    }
}
