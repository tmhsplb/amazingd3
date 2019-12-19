using System;
//using System.Windows.Forms;

namespace AmazingD3.Models
{
    [Serializable]
	public class Sunriset
	{
		public double sunrise;
		public double sunset;
		public int rc;

		public Sunriset()
		{
		}

		private static double toRadians(double deg) 
		{
			return((deg * Math.PI)/180.0);
		}

		private static double toDegrees(double rad) 
		{
			return((rad *180.0)/Math.PI);
		}

		private static double sind(double x) 
		{
			return (Math.Sin(toRadians(x)));
		}

		private static double cosd(double x) 
		{
			return (Math.Cos(toRadians(x)));
		}

		private static double tand(double x) 
		{
			return (Math.Tan(toRadians(x)));
		}

		private static double atand(double x) 
		{
			return (toDegrees(Math.Atan(x)));
		}

		private static double asind(double x) 
		{
			return (toDegrees(Math.Asin(x)));
		}

		private static double acosd(double x) 
		{
			return (toDegrees(Math.Acos(x)));
		}

		private static double atan2d(double x, double y) 
		{
			return (toDegrees(Math.Atan2(y, x)));
		}

		private static double Revolution(double x) 
		{
			return(x - 360 * Math.Floor(x/360.0));
		}

		public static double rev180(double x) 
		{
			return(x - 360 * Math.Floor((x/360.0) + 0.5));
		}

		public static double GMST0(double d) 
		{
			double sidtime0;
			sidtime0 = Revolution((180.0 + 356.0470 + 282.9404) + (0.9856002585 + 4.70935E-5)*d);
			return(sidtime0);
		}

		public static int IntegerPart(double x) 
		{
			int k = (int)Math.Round(x);
			int ip = 0;

			if (k == x) ip = (int)k;
			else 
			{
				if (x > 0) 
				{
					if (k < x) 
					{
						ip = (int)k;
					}
					else if (x < k)
						ip = (int)k - 1;
				}
				else if (x < 0) 
				{
					if (k < x)
						ip = (int)k + 1;
					else
						ip = (int)k;
				}
				else
					ip = 0;
			}
			return(ip);
		}

		public static double FractionalPart(double x) 
		{
			double fp;
			if (x > 0) 
			{
				fp = x - Math.Floor(x);
			} 
			else if (x < 0) 
			{
				fp = x + Math.Abs(Math.Ceiling(x));
			} 
			else fp = 0.0;
			return(fp);
		}


		public static double DaysSinceEpoch(int yr, int mo, int date, double ut) 
		{
			int leapDays = ((yr - 2000) + 4)/4;
				 
			DateTime dt = new DateTime(yr, mo, date);
			int day;
			Boolean isLeapYear = (yr % 4 == 0 ? true : false);
			double time;
				 
			day = dt.DayOfYear;

			// Subtract the leapday for this year because it is included
			// in the value returned by cal.get(Calendar.DAY_OF_YEAR)
			if (isLeapYear == true) leapDays = leapDays - 1;

			time = (365 * (yr - 2000)) + day + leapDays;
			// Jan. 1, 2000 is day 0 of epoch, not day 1.
			time = (time - 1) + ut/24.0;
			return(time);
		}

        
		public static Sunpos sunpos(/*TextBox tb,*/ double d, int debug) 
		{
			double M;  // mean anomaly
			double w;  // omega
			double ecc;  // eccentricity
			double EA;   // eccentric anomaly;
			double x, y;
			double v;  // true anomaly
			double lon;  // true longitude
			double r;   // radius

			M = Revolution(356.0470 + (0.9856002585 * d));

			w = 282.9404 + (4.70935E-5) * d;
 
			ecc = 0.016709 - (1.151E-9) * d;
 
			EA = M + (toDegrees(ecc)) * sind(M) * (1.0 + ecc*cosd(M));
			 
			x = cosd(EA) - ecc;

			y = Math.Sqrt(1 - Math.Pow(ecc, 2.0)) * sind(EA);
			 
			r = Math.Sqrt(Math.Pow(x, 2.0) + Math.Pow(y, 2.0));
		 
			v = atan2d(x, y);

			lon = v + w;
			if (lon >= 360.0) lon = lon - 360.0;

			return( new Sunpos(lon, r) );

		}
        

		public static RAdec sunRAdec(/*TextBox tb,*/ double d, int debug) 
		{
			Sunpos spos;
			double x, y, z;
			double oblEcl;
			double ra, dec;

			spos = sunpos(/*tb,*/ d, 0);

			// Compute the ecliptic (heliocentric) rectangular coordinates (z = 0)
			x = spos.solarRadius * cosd(spos.solarLongitude);
			y = spos.solarRadius * sind(spos.solarLongitude);

			// Compute the obliquity of ecliptic (inclination of Earth's axis)
			oblEcl = 23.4393 - (3.563E-7) * d;

			// Convert to equatorial rectangular coordinates - x is unchanged
			z = y * sind(oblEcl);
			y = y * cosd(oblEcl);

			// Extract right ascension and declination from equatorial coordinates.
			ra = atan2d(x, y);
			dec = atan2d(Math.Sqrt(Math.Pow(x, 2.0) + Math.Pow(y, 2.0)), z);

			return( new RAdec(ra, dec, spos.solarRadius) );

		}


		public static SunOfDate sunriset(int yr, int mo, int date, double lon, double lat, double altit, Boolean upperLimb) 
		{
			return sunriset(yr, mo, date, lon, lat, altit, upperLimb, 0);
		}


		public static SunOfDate sunriset(int yr, int mo, int date, double lon, double lat, double altit, Boolean upperLimb, int debug) 
		{ 
				double sunUp;
				double sunDown;
				int rc;
				double d;
				double sidtime;
				RAdec radec;
				double sradius;
				double el;  // elevation
				double cost;  // hour angle

				// tsouth is the time of midday. Schlyter refers to
				// this as the sun "being in the south."
				double tsouth;
			    double LHA;
				double t;

				sunUp = 0;
				sunDown = 0;

				// Initialize return code flag
				rc = 0;

				// compute d of 12h local mean solar time
				d = DaysSinceEpoch(yr, mo, date, 0) + 0.5 - lon/360.0;

				// compute local sidereal time at time d
				sidtime = Revolution(GMST0(d) + 180.0 + lon);
	 

				// compute the sun's RA + dec at time d
				radec = sunRAdec(/*tb,*/ d, 0);
             
				tsouth = 12.0 - rev180(sidtime - radec.ra)/15.0;
				 
			    LHA = rev180(sidtime - radec.ra);

				// compute the sun's apparent radius in degrees
				sradius = 0.2666/radec.solarRadius;

				// do correction to upper limb, if necesary
				if (upperLimb == true) 
				{
					el = altit - sradius;
				} 
				else el = altit;

				cost = (sind(el) - sind(lat) * sind(radec.dec)) / (cosd(lat) * cosd(radec.dec));

				if (cost >= 1.0) 
				{
					rc = -1;
					t = 0.0;
				} 
				else if (cost <= -1.0) 
				{
					rc = +1;
					t = 12.0;
				} 
				else 
				{
					t = acosd(cost)/15.0;
				}

				sunUp = tsouth - t;
				sunDown = tsouth + t;
 
				return new SunOfDate(sunUp, sunDown, radec, rc);
			}

		public double farNorth(double jd, double guess, double incr, double el, double sdec) 
		{

			int rc;  // return code
			double lat = guess;
			double cost;

			// Initialize return code
			rc = 0;

			while (rc == 0) 
			{
				lat = lat + incr;

				if (lat > 89) 
				{
					lat = 90.0;
					break;
				}

				// compute the diurnal arc that the sun traverses to
				// reach the specified altitude (= elevation), el

				cost = (sind(el) - sind(lat) * sind(sdec))/(cosd(lat) * cosd(sdec));

				if (cost >= 1.0) 
				{
					rc = -1;
				} 
				else if (cost <= -1.0) 
				{
					rc = +1;
				}
			} // end while

			return(lat);
		}

		public double northPole(double jd, double guess) 
		{
			double altit = -35.0/60.0;
			double incr = 1.0;
			double lb, ub;
			RAdec radec;

			// compute the sun's ra and declination at time jd
			radec = sunRAdec(jd, 0);

			ub = farNorth(jd, guess, incr, altit, radec.dec);
			//System.out.println("north pole guess = " + guess + " first refinement = "+ ub);
			lb = ub - incr;

			for(int k = 1; k < 6; k++) 
			{
				incr = incr/10.0;
				ub = farNorth(jd, lb, incr, altit, radec.dec);
				//System.out.println("   next refinement = " + ub);
				lb = ub - incr;
			}

			return(ub);
		}

		public double farSouth(double jd, double guess, double incr, double el, double sdec) 
		{

			int rc;  // return code
			double lat = guess;
			double cost;

			// Initialize return code
			rc = 0;

			while (rc == 0) 
			{
				lat = lat + incr;

				if (lat < -89) 
				{
					lat = -90.0;
					break;
				}

				// compute the diurnal arc that the sun traverses to
				// reach the specified altitude (= elevation), el

				cost = (sind(el) - sind(lat) * sind(sdec))/(cosd(lat) * cosd(sdec));

				if (cost >= 1.0) 
				{
					rc = -1;
				} 
				else if (cost <= -1.0) 
				{
					rc = +1;
				}
			} // end while

			return(lat);
		}

		public double southPole(double jd, double guess) 
		{
			double altit = -35.0/60.0;
			double incr = -1.0;
			double lb, ub;
			RAdec radec;

			// compute the sun's ra and declination at time jd
			radec = sunRAdec(jd, 0);

			ub = farSouth(jd, guess, incr, altit, radec.dec);
			lb = ub - incr;

			for(int k = 1; k < 6; k++) 
			{
				incr = incr/10.0;
				ub = farSouth(jd, lb, incr, altit, radec.dec);
				lb = ub - incr;
			}

			return(ub);
		}
	}	
}
