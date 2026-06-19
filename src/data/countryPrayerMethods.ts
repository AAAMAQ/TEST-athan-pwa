import type { HighLatKey, MadhabKey, MethodKey } from '../lib/prayer'

export type CountryPrayerConfig = {
  countryCode: string
  countryName: string
  defaultMethod: MethodKey
  alternativeMethods: MethodKey[]
  defaultMadhab: MadhabKey
  highLatitudeRule: HighLatKey
  notes?: string
  sourceType?: 'official' | 'regional-common' | 'fallback'
}

export const GLOBAL_FALLBACK_COUNTRY_CONFIG: CountryPrayerConfig = {
  countryCode: 'ZZ',
  countryName: 'Global fallback',
  defaultMethod: 'MuslimWorldLeague',
  alternativeMethods: ['MoonsightingCommittee', 'NorthAmerica'],
  defaultMadhab: 'Shafi',
  highLatitudeRule: 'MiddleOfTheNight',
  notes: 'No country-specific setting was available, so Athan PWA used the global fallback. Compare with a trusted local masjid.',
  sourceType: 'fallback'
}

const commonFallback = (countryCode: string, countryName: string): CountryPrayerConfig => ({
  ...GLOBAL_FALLBACK_COUNTRY_CONFIG,
  countryCode,
  countryName,
  notes: 'Regional practices may differ. Use Auto as a starting point and compare with your local masjid.',
  sourceType: 'fallback'
})

const PRIMARY_COUNTRY_PRAYER_CONFIGS: CountryPrayerConfig[] = [
  { countryCode: 'IN', countryName: 'India', defaultMethod: 'Karachi', alternativeMethods: ['MuslimWorldLeague'], defaultMadhab: 'Hanafi', highLatitudeRule: 'MiddleOfTheNight', notes: 'Karachi is commonly used across the subcontinent; local masjids may publish custom timetables.', sourceType: 'regional-common' },
  { countryCode: 'PK', countryName: 'Pakistan', defaultMethod: 'Karachi', alternativeMethods: ['MuslimWorldLeague'], defaultMadhab: 'Hanafi', highLatitudeRule: 'MiddleOfTheNight', sourceType: 'regional-common' },
  { countryCode: 'BD', countryName: 'Bangladesh', defaultMethod: 'Karachi', alternativeMethods: ['MuslimWorldLeague'], defaultMadhab: 'Hanafi', highLatitudeRule: 'MiddleOfTheNight', sourceType: 'regional-common' },
  { countryCode: 'SA', countryName: 'Saudi Arabia', defaultMethod: 'UmmAlQura', alternativeMethods: ['MuslimWorldLeague'], defaultMadhab: 'Shafi', highLatitudeRule: 'MiddleOfTheNight', sourceType: 'regional-common' },
  { countryCode: 'AE', countryName: 'United Arab Emirates', defaultMethod: 'Dubai', alternativeMethods: ['UmmAlQura', 'MuslimWorldLeague'], defaultMadhab: 'Shafi', highLatitudeRule: 'MiddleOfTheNight', sourceType: 'regional-common' },
  { countryCode: 'QA', countryName: 'Qatar', defaultMethod: 'Qatar', alternativeMethods: ['UmmAlQura', 'MuslimWorldLeague'], defaultMadhab: 'Shafi', highLatitudeRule: 'MiddleOfTheNight', sourceType: 'regional-common' },
  { countryCode: 'KW', countryName: 'Kuwait', defaultMethod: 'Kuwait', alternativeMethods: ['UmmAlQura'], defaultMadhab: 'Shafi', highLatitudeRule: 'MiddleOfTheNight', sourceType: 'regional-common' },
  { countryCode: 'EG', countryName: 'Egypt', defaultMethod: 'Egyptian', alternativeMethods: ['MuslimWorldLeague'], defaultMadhab: 'Shafi', highLatitudeRule: 'MiddleOfTheNight', sourceType: 'regional-common' },
  { countryCode: 'TR', countryName: 'Turkey', defaultMethod: 'Turkey', alternativeMethods: ['MuslimWorldLeague'], defaultMadhab: 'Hanafi', highLatitudeRule: 'MiddleOfTheNight', sourceType: 'regional-common' },
  { countryCode: 'SG', countryName: 'Singapore', defaultMethod: 'Singapore', alternativeMethods: ['MuslimWorldLeague'], defaultMadhab: 'Shafi', highLatitudeRule: 'MiddleOfTheNight', sourceType: 'regional-common' },
  { countryCode: 'US', countryName: 'United States', defaultMethod: 'NorthAmerica', alternativeMethods: ['MoonsightingCommittee', 'MuslimWorldLeague'], defaultMadhab: 'Shafi', highLatitudeRule: 'MiddleOfTheNight', sourceType: 'regional-common' },
  { countryCode: 'CA', countryName: 'Canada', defaultMethod: 'NorthAmerica', alternativeMethods: ['MoonsightingCommittee', 'MuslimWorldLeague'], defaultMadhab: 'Shafi', highLatitudeRule: 'MiddleOfTheNight', sourceType: 'regional-common' },
  { countryCode: 'GB', countryName: 'United Kingdom', defaultMethod: 'MuslimWorldLeague', alternativeMethods: ['MoonsightingCommittee'], defaultMadhab: 'Hanafi', highLatitudeRule: 'TwilightAngle', notes: 'UK mosques often use local timetables; high-latitude handling varies.', sourceType: 'regional-common' },
  { countryCode: 'FR', countryName: 'France', defaultMethod: 'MuslimWorldLeague', alternativeMethods: ['MoonsightingCommittee'], defaultMadhab: 'Shafi', highLatitudeRule: 'TwilightAngle', sourceType: 'regional-common' },
  { countryCode: 'DE', countryName: 'Germany', defaultMethod: 'MuslimWorldLeague', alternativeMethods: ['MoonsightingCommittee'], defaultMadhab: 'Shafi', highLatitudeRule: 'TwilightAngle', sourceType: 'regional-common' },
  { countryCode: 'NL', countryName: 'Netherlands', defaultMethod: 'MuslimWorldLeague', alternativeMethods: ['MoonsightingCommittee'], defaultMadhab: 'Shafi', highLatitudeRule: 'TwilightAngle', sourceType: 'regional-common' },
  { countryCode: 'NO', countryName: 'Norway', defaultMethod: 'MuslimWorldLeague', alternativeMethods: ['MoonsightingCommittee'], defaultMadhab: 'Shafi', highLatitudeRule: 'TwilightAngle', sourceType: 'regional-common' },
  { countryCode: 'SE', countryName: 'Sweden', defaultMethod: 'MuslimWorldLeague', alternativeMethods: ['MoonsightingCommittee'], defaultMadhab: 'Shafi', highLatitudeRule: 'TwilightAngle', sourceType: 'regional-common' },
  { countryCode: 'FI', countryName: 'Finland', defaultMethod: 'MuslimWorldLeague', alternativeMethods: ['MoonsightingCommittee'], defaultMadhab: 'Shafi', highLatitudeRule: 'TwilightAngle', sourceType: 'regional-common' },
  { countryCode: 'AU', countryName: 'Australia', defaultMethod: 'MuslimWorldLeague', alternativeMethods: ['MoonsightingCommittee'], defaultMadhab: 'Shafi', highLatitudeRule: 'MiddleOfTheNight', sourceType: 'regional-common' },
  { countryCode: 'NZ', countryName: 'New Zealand', defaultMethod: 'MuslimWorldLeague', alternativeMethods: ['MoonsightingCommittee'], defaultMadhab: 'Shafi', highLatitudeRule: 'MiddleOfTheNight', sourceType: 'regional-common' },
  { countryCode: 'MY', countryName: 'Malaysia', defaultMethod: 'Singapore', alternativeMethods: ['MuslimWorldLeague'], defaultMadhab: 'Shafi', highLatitudeRule: 'MiddleOfTheNight', sourceType: 'regional-common' },
  { countryCode: 'ID', countryName: 'Indonesia', defaultMethod: 'Singapore', alternativeMethods: ['MuslimWorldLeague'], defaultMadhab: 'Shafi', highLatitudeRule: 'MiddleOfTheNight', sourceType: 'regional-common' },
  { countryCode: 'IR', countryName: 'Iran', defaultMethod: 'Tehran', alternativeMethods: ['MuslimWorldLeague'], defaultMadhab: 'Shafi', highLatitudeRule: 'MiddleOfTheNight', sourceType: 'regional-common' }
]

const BROAD_FALLBACK_COUNTRIES: Array<[string, string]> = [
  ['AD', 'Andorra'], ['AF', 'Afghanistan'], ['AG', 'Antigua and Barbuda'], ['AI', 'Anguilla'], ['AL', 'Albania'],
  ['AM', 'Armenia'], ['AO', 'Angola'], ['AQ', 'Antarctica'], ['AR', 'Argentina'], ['AS', 'American Samoa'],
  ['AT', 'Austria'], ['AW', 'Aruba'], ['AX', 'Aland Islands'], ['AZ', 'Azerbaijan'], ['BA', 'Bosnia and Herzegovina'],
  ['BB', 'Barbados'], ['BE', 'Belgium'], ['BF', 'Burkina Faso'], ['BG', 'Bulgaria'], ['BH', 'Bahrain'],
  ['BI', 'Burundi'], ['BJ', 'Benin'], ['BL', 'Saint Barthelemy'], ['BM', 'Bermuda'], ['BN', 'Brunei'],
  ['BO', 'Bolivia'], ['BQ', 'Caribbean Netherlands'], ['BR', 'Brazil'], ['BS', 'Bahamas'], ['BT', 'Bhutan'],
  ['BV', 'Bouvet Island'], ['BW', 'Botswana'], ['BY', 'Belarus'], ['BZ', 'Belize'], ['CC', 'Cocos Islands'],
  ['CD', 'Democratic Republic of the Congo'], ['CF', 'Central African Republic'], ['CG', 'Republic of the Congo'], ['CH', 'Switzerland'], ['CI', 'Cote d’Ivoire'],
  ['CK', 'Cook Islands'], ['CL', 'Chile'], ['CM', 'Cameroon'], ['CN', 'China'], ['CO', 'Colombia'],
  ['CR', 'Costa Rica'], ['CU', 'Cuba'], ['CV', 'Cape Verde'], ['CW', 'Curacao'], ['CX', 'Christmas Island'],
  ['CY', 'Cyprus'], ['CZ', 'Czechia'], ['DJ', 'Djibouti'], ['DK', 'Denmark'], ['DM', 'Dominica'],
  ['DO', 'Dominican Republic'], ['DZ', 'Algeria'], ['EC', 'Ecuador'], ['EE', 'Estonia'], ['EH', 'Western Sahara'],
  ['ER', 'Eritrea'], ['ES', 'Spain'], ['ET', 'Ethiopia'], ['FJ', 'Fiji'], ['FK', 'Falkland Islands'],
  ['FM', 'Micronesia'], ['FO', 'Faroe Islands'], ['GA', 'Gabon'], ['GD', 'Grenada'], ['GE', 'Georgia'],
  ['GF', 'French Guiana'], ['GG', 'Guernsey'], ['GH', 'Ghana'], ['GI', 'Gibraltar'], ['GL', 'Greenland'],
  ['GM', 'Gambia'], ['GN', 'Guinea'], ['GP', 'Guadeloupe'], ['GQ', 'Equatorial Guinea'], ['GR', 'Greece'],
  ['GS', 'South Georgia and the South Sandwich Islands'], ['GT', 'Guatemala'], ['GU', 'Guam'], ['GW', 'Guinea-Bissau'], ['GY', 'Guyana'],
  ['HK', 'Hong Kong'], ['HM', 'Heard Island and McDonald Islands'], ['HN', 'Honduras'], ['HR', 'Croatia'], ['HT', 'Haiti'],
  ['HU', 'Hungary'], ['IE', 'Ireland'], ['IL', 'Israel'], ['IM', 'Isle of Man'], ['IO', 'British Indian Ocean Territory'],
  ['IQ', 'Iraq'], ['IS', 'Iceland'], ['IT', 'Italy'], ['JE', 'Jersey'], ['JM', 'Jamaica'],
  ['JO', 'Jordan'], ['JP', 'Japan'], ['KE', 'Kenya'], ['KG', 'Kyrgyzstan'], ['KH', 'Cambodia'],
  ['KI', 'Kiribati'], ['KM', 'Comoros'], ['KN', 'Saint Kitts and Nevis'], ['KP', 'North Korea'], ['KR', 'South Korea'],
  ['KY', 'Cayman Islands'], ['KZ', 'Kazakhstan'], ['LA', 'Laos'], ['LB', 'Lebanon'], ['LC', 'Saint Lucia'],
  ['LI', 'Liechtenstein'], ['LK', 'Sri Lanka'], ['LR', 'Liberia'], ['LS', 'Lesotho'], ['LT', 'Lithuania'],
  ['LU', 'Luxembourg'], ['LV', 'Latvia'], ['LY', 'Libya'], ['MA', 'Morocco'], ['MC', 'Monaco'],
  ['MD', 'Moldova'], ['ME', 'Montenegro'], ['MF', 'Saint Martin'], ['MG', 'Madagascar'], ['MH', 'Marshall Islands'],
  ['MK', 'North Macedonia'], ['ML', 'Mali'], ['MM', 'Myanmar'], ['MN', 'Mongolia'], ['MO', 'Macau'],
  ['MP', 'Northern Mariana Islands'], ['MQ', 'Martinique'], ['MR', 'Mauritania'], ['MS', 'Montserrat'], ['MT', 'Malta'],
  ['MU', 'Mauritius'], ['MV', 'Maldives'], ['MW', 'Malawi'], ['MX', 'Mexico'], ['MZ', 'Mozambique'],
  ['NA', 'Namibia'], ['NC', 'New Caledonia'], ['NE', 'Niger'], ['NF', 'Norfolk Island'], ['NG', 'Nigeria'],
  ['NI', 'Nicaragua'], ['NP', 'Nepal'], ['NR', 'Nauru'], ['NU', 'Niue'], ['OM', 'Oman'],
  ['PA', 'Panama'], ['PE', 'Peru'], ['PF', 'French Polynesia'], ['PG', 'Papua New Guinea'], ['PH', 'Philippines'],
  ['PL', 'Poland'], ['PM', 'Saint Pierre and Miquelon'], ['PN', 'Pitcairn Islands'], ['PR', 'Puerto Rico'], ['PS', 'Palestine'],
  ['PT', 'Portugal'], ['PW', 'Palau'], ['PY', 'Paraguay'], ['RE', 'Reunion'], ['RO', 'Romania'],
  ['RS', 'Serbia'], ['RU', 'Russia'], ['RW', 'Rwanda'], ['SB', 'Solomon Islands'], ['SC', 'Seychelles'],
  ['SD', 'Sudan'], ['SH', 'Saint Helena'], ['SI', 'Slovenia'], ['SJ', 'Svalbard and Jan Mayen'], ['SK', 'Slovakia'],
  ['SL', 'Sierra Leone'], ['SM', 'San Marino'], ['SN', 'Senegal'], ['SO', 'Somalia'], ['SR', 'Suriname'],
  ['SS', 'South Sudan'], ['ST', 'Sao Tome and Principe'], ['SV', 'El Salvador'], ['SX', 'Sint Maarten'], ['SY', 'Syria'],
  ['SZ', 'Eswatini'], ['TC', 'Turks and Caicos Islands'], ['TD', 'Chad'], ['TF', 'French Southern Territories'], ['TG', 'Togo'],
  ['TH', 'Thailand'], ['TJ', 'Tajikistan'], ['TK', 'Tokelau'], ['TL', 'Timor-Leste'], ['TM', 'Turkmenistan'],
  ['TN', 'Tunisia'], ['TO', 'Tonga'], ['TT', 'Trinidad and Tobago'], ['TV', 'Tuvalu'], ['TW', 'Taiwan'],
  ['TZ', 'Tanzania'], ['UA', 'Ukraine'], ['UG', 'Uganda'], ['UM', 'United States Minor Outlying Islands'], ['UY', 'Uruguay'],
  ['UZ', 'Uzbekistan'], ['VA', 'Vatican City'], ['VC', 'Saint Vincent and the Grenadines'], ['VE', 'Venezuela'], ['VG', 'British Virgin Islands'],
  ['VI', 'U.S. Virgin Islands'], ['VN', 'Vietnam'], ['VU', 'Vanuatu'], ['WF', 'Wallis and Futuna'], ['WS', 'Samoa'],
  ['XK', 'Kosovo'], ['YE', 'Yemen'], ['YT', 'Mayotte'], ['ZA', 'South Africa'], ['ZM', 'Zambia'], ['ZW', 'Zimbabwe']
]

const primaryCountryCodes = new Set(PRIMARY_COUNTRY_PRAYER_CONFIGS.map((item) => item.countryCode))

export const COUNTRY_PRAYER_CONFIGS: CountryPrayerConfig[] = [
  ...PRIMARY_COUNTRY_PRAYER_CONFIGS,
  ...BROAD_FALLBACK_COUNTRIES
    .filter(([code]) => !primaryCountryCodes.has(code))
    .map(([code, name]) => commonFallback(code, name))
]

export function getCountryPrayerConfig(countryCode?: string | null): CountryPrayerConfig {
  if (!countryCode) return GLOBAL_FALLBACK_COUNTRY_CONFIG
  return COUNTRY_PRAYER_CONFIGS.find((item) => item.countryCode === countryCode.toUpperCase()) ?? {
    ...GLOBAL_FALLBACK_COUNTRY_CONFIG,
    countryCode: countryCode.toUpperCase()
  }
}
