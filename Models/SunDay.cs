using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AmazingD3.Models
{
    public class SunDay
    {
        public int year;
        public int month;
        public int day;
        public int[] sunrise;
        public int[] sunset;
        public string dayLength;

        public SunDay(int day, int month, int year)
        {
            this.year = year;
            this.month = month;
            this.day = day;
        }
    }
}