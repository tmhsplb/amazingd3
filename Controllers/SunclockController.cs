using AmazingD3.Models;
using LinqToExcel;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace AmazingD3.Controllers
{
    public class SunclockController : ApiController
    {
        public delegate double DelegateFractionalPart(double x);
        public delegate int DelegateIntegerPart(double x);

        DelegateIntegerPart IntegerPart = new DelegateIntegerPart(Sunriset.IntegerPart);
        DelegateFractionalPart FractionalPart = new DelegateFractionalPart(Sunriset.FractionalPart);

        string degSymbol = "\u00BA";  // unicode for the degree symbol

        private int Minutes(double fractionalMinutes)
        {
            return (int)Math.Round(fractionalMinutes * 60.0);
        }

        public Suntimes Get(int year, int month, int date, double longitude, double latitude, double gmtOffset, double dstOffset)
        {
            double sunrise, sunset, daylen, midday;
            int middayHr, middayMin;
            int sunriseHr, sunriseMin;
            int sunsetHr, sunsetMin;
            int daylengthHr, daylengthMin;

            bool dst = dstOffset > 0;
            Suntimes suntimes = new Suntimes();

            /* This section was used to test whether AppHarbor will support
             * a LinqToExcel application. The answer seems to be yes, which
             * means AppHarbor has the Access Database Engine loaded onto
             * the server used for deployment.
             * /
            var apricotReportFile = new ExcelQueryFactory("AR.xlsx");

            // Set suntimes.Sunset to arf below as part of the test.
            string arf = apricotReportFile.FileName;

            apricotReportFile.DatabaseEngine = LinqToExcel.Domain.DatabaseEngine.Ace;

            apricotReportFile.AddMapping("RecordID", "Interview Record ID");
            apricotReportFile.AddMapping("LBVDCheckNum", "LBVD Check Number");
            apricotReportFile.AddMapping("LBVDCheckDisposition", "LBVD Check Disposition");
            */

            int longitudeDegrees = Math.Abs(IntegerPart(longitude));
            int longitudeMinutes = Math.Abs(Minutes(FractionalPart(longitude)));

            int latitudeDegrees = Math.Abs(IntegerPart(latitude));
            int latitudeMinutes = Math.Abs(Minutes(FractionalPart(latitude)));

            suntimes.Longitude = string.Format("{0}{1} {2}\' {3}",
                longitudeDegrees, degSymbol,
                longitudeMinutes, (longitude < 0 ? 'W' : 'E'));

            suntimes.Latitude = string.Format("{0}{1} {2}\' {3}",
               latitudeDegrees, degSymbol,
               latitudeMinutes, (latitude < 0 ? 'S' : 'N'));


            SunOfDate sd = Sunriset.sunriset(year, month, date, longitude, latitude, -35.0 / 60.0, true);

            sunrise = sd.sunrise + gmtOffset;
            sunset = sd.sunset + gmtOffset;

            daylen = sunset - sunrise;

            if (daylen == 0.0)
            {
                suntimes.Sunrise = "N/A";
                suntimes.Sunset = "N/A";
                suntimes.DayLength = "0:00";
            }
            else if (daylen == 24.0)
            {
                suntimes.Sunrise = "N/A";
                suntimes.Sunset = "N/A";
                suntimes.DayLength = "24:00";
            }
            else if (sd.rc != 0)
            {
                suntimes.Sunrise = "N/A";
                suntimes.Sunset = "N/A";
                suntimes.Midday = "N/A";
                suntimes.DayLength = "N/A";
            }
            else
            {
                midday = (sunset + sunrise) / 2.0;
                middayHr = Sunriset.IntegerPart(midday);

                if (dst)
                {
                    middayHr = middayHr + 1;
                    sunrise = sunrise + 1;
                    sunset = sunset + 1;
                }

                middayMin = IntegerPart(FractionalPart(midday) * 60);

                sunriseHr = IntegerPart(sunrise);
                sunriseMin = IntegerPart(FractionalPart(sunrise) * 60);

                sunsetHr = IntegerPart(sunset);
                sunsetMin = IntegerPart(FractionalPart(sunset) * 60);

                daylengthHr = IntegerPart(daylen);
                daylengthMin = IntegerPart(FractionalPart(daylen) * 60);

                suntimes.Sunrise = string.Format("{0}:{1}",
                   sunriseHr < 10 ? string.Format("0{0}", sunriseHr) : string.Format("{0}", sunriseHr),
                   sunriseMin < 10 ? string.Format("0{0}", sunriseMin) : string.Format("{0}", sunriseMin));

                suntimes.Midday = string.Format("{0}:{1}",
                    middayHr < 10 ? string.Format("0{0}", middayHr) : string.Format("{0}", middayHr),
                    middayMin < 10 ? string.Format("0{0}", middayMin) : string.Format("{0}", middayMin));

                suntimes.Sunset = string.Format("{0}:{1}",
                  sunsetHr < 10 ? string.Format("0{0}", sunsetHr) : string.Format("{0}", sunsetHr),
                  sunsetMin < 10 ? string.Format("0{0}", sunsetMin) : string.Format("{0}", sunsetMin));

            //    suntimes.Sunset = arf;

                suntimes.DayLength = string.Format("{0}:{1}",
                   daylengthHr < 10 ? string.Format("0{0}", daylengthHr) : string.Format("{0}", daylengthHr),
                   daylengthMin < 10 ? string.Format("0{0}", daylengthMin) : string.Format("{0}", daylengthMin));                   
            }

            return suntimes;
        }
  
        public SunDay[] Get(int year, double longitude, double latitude, double gmtOffset)
        {
            double sunrise, sunset, daylen, midday;
            int middayHr, middayMin;
            int sunriseHr, sunriseMin;
            int sunsetHr, sunsetMin;
            int daylengthHr, daylengthMin;
            Boolean isLeapYear = (year % 4 == 0 ? true : false);
            int[] monthDays = new int[] {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
            List<SunDay> sunyear = new List<SunDay>();

            Suntimes suntimes = new Suntimes();

            for (int month = 0; month < 12; month++)
            {
                int days = monthDays[month];
                if (month == 1 && isLeapYear)
                {
                    days = days + 1; // Feb. has 29 days in a leap year
                }

                for (int date = 1; date <= days; date++)
                {
                    SunOfDate sd = Sunriset.sunriset(year, month + 1, date, longitude, latitude, -35.0 / 60.0, true);
                    SunDay sunday = new SunDay(date, month, year);

                    sunrise = sd.sunrise + gmtOffset;
                    sunset = sd.sunset + gmtOffset;

                    daylen = sunset - sunrise;

                    if (daylen == 0.0)
                    {
                        sunday.sunrise = new int[] {0, 0};
                        sunday.sunset = new int[] {0, 0};
                        sunday.dayLength = "0:0";
                        
                    }
                    else if (daylen == 24.0)
                    {
                        sunday.sunrise = new int[] {-1, -1};
                        sunday.sunset = new int[] {-1, -1};
                        sunday.dayLength = "24:00";
                    }
                    else if (sd.rc != 0)
                    {
                        sunday.sunrise = new int[] {-2, -2};
                        sunday.sunset = new int[] {-2, -2};
                         
                        sunday.dayLength = "N/A";
                    }
                    else
                    {
                        midday = (sunset + sunrise) / 2.0;
                        middayHr = Sunriset.IntegerPart(midday);

                        middayMin = IntegerPart(FractionalPart(midday) * 60);

                        sunriseHr = IntegerPart(sunrise);
                        sunriseMin = IntegerPart(FractionalPart(sunrise) * 60);

                        sunsetHr = IntegerPart(sunset);
                        sunsetMin = IntegerPart(FractionalPart(sunset) * 60);

                        daylengthHr = IntegerPart(daylen);
                        daylengthMin = IntegerPart(FractionalPart(daylen) * 60);

                        sunday.sunrise = new int[] { sunriseHr, sunriseMin };
                        sunday.sunset = new int[] { sunsetHr, sunsetMin };
                         
                        sunday.dayLength = string.Format("{0}:{1}",
                          daylengthHr < 10 ? string.Format("0{0}", daylengthHr) : string.Format("{0}", daylengthHr),
                          daylengthMin < 10 ? string.Format("0{0}", daylengthMin) : string.Format("{0}", daylengthMin));   
                    }

                    sunyear.Add(sunday);
                }
            }

            return sunyear.ToArray();
        }
    }
}