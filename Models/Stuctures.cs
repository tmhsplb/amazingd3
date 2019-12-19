using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AmazingD3.Models
{
     
	public struct RAdec {
		public double ra;
		public double dec;
		public double solarRadius;

		public RAdec(double ra, double dec, double solarRadius) {
			this.ra = ra;
			this.dec = dec;
			this.solarRadius = solarRadius;
		}
	}

	public struct Sunpos {
		public double solarLongitude;
		public double solarRadius;

		public Sunpos(double lon, double radius) {
			solarLongitude = lon;
			solarRadius = radius;
		}

	}
	
	public struct SunOfDate {
		public double sunrise;
		public double sunset;
		public RAdec radec;
		public int rc;

		public SunOfDate(double sunrise, double sunset, RAdec radec, int rc) {
			this.sunrise = sunrise;
			this.sunset = sunset;
			this.radec = radec;
			this.rc = rc;
		}
	}

    public struct Site
    {
        public String name;
        public String lambdaD, lambdaM;
        public String phiD, phiM;
        public char lambdaDir, phiDir;
        public int timezone;
        public int subZone;

        public delegate double DelegateFractionalPart(double x);
        public delegate int DelegateIntegerPart(double x);


        DelegateIntegerPart IntegerPart; // = new DelegateIntegerPart(Sunriset.IntegerPart);
        DelegateFractionalPart FractionalPart; // = new DelegateFractionalPart(Sunriset.FractionalPart);


        public Site(int x)
        {
            name = "";
            lambdaD = lambdaM = phiD = phiM = "";
            lambdaDir = 'W';
            phiDir = 'N';
            timezone = 0;
            subZone = 0;
            IntegerPart = new DelegateIntegerPart(Sunriset.IntegerPart);
            FractionalPart = new DelegateFractionalPart(Sunriset.FractionalPart);
        }

        public void setLongitude(String lonD, String lonM, char hemisphere)
        {
            lambdaD = lonD;
            lambdaM = lonM;
            lambdaDir = hemisphere;
        }

        public void setLatitude(String latD, String latM, char hemisphere)
        {
            phiD = latD;
            phiM = latM;
            phiDir = hemisphere;
        }
    }
}