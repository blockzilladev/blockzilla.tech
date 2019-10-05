
$(document).ready(function() {
  var peers = [
    {
      "latLng": [39.0481, -77.4728],
      "name": "Ashburn, United States"
    }, {
      "latLng": [53.3331, -6.2489],
      "name": "Dublin, Ireland"
    }, {
      "latLng": [53.3331, -6.2489],
      "name": "Dublin, Ireland"
    }, {
      "latLng": [47.6062, -122.3321],
      "name": "Seattle, United States"
    }, {
      "latLng": [35.685, 139.7514],
      "name": "Tokyo, Japan"
    }, {
      "latLng": [39.0481, -77.4728],
      "name": "Ashburn, United States"
    }, {
      "latLng": [-23.5733, -46.6417],
      "name": "S\u00e3o Paulo, Brazil"
    }, {
      "latLng": [47.6062, -122.3321],
      "name": "Seattle, United States"
    }, {
      "latLng": [48.8162, 2.3139],
      "name": "Montrouge, France"
    }, {
      "latLng": [-34.6033, -58.3816],
      "name": "Buenos Aires, Argentina"
    }, {
      "latLng": [35.685, 139.7514],
      "name": "Tokyo, Japan"
    }, {
      "latLng": [-33.8612, 151.1982],
      "name": "Sydney, Australia"
    }, {
      "latLng": [41.8919, 12.5113],
      "name": "Rome, Italy"
    }, {
      "latLng": [33.749, -84.388],
      "name": "Atlanta, United States"
    }, {
      "latLng": [41.8919, 12.5113],
      "name": "Rome, Italy"
    }, {
      "latLng": [-34.67, -58.7528],
      "name": "Merlo, Argentina"
    }, {
      "latLng": [51.4567, -0.2304],
      "name": "Roehampton, United Kingdom"
    }, {
      "latLng": [25.0478, 121.5318],
      "name": "Taipei, Taiwan"
    }, {
      "latLng": [1.2931, 103.8558],
      "name": "Singapore, Singapore"
    }, {
      "latLng": [1.2931, 103.8558],
      "name": "Singapore, Singapore"
    }, {
      "latLng": [37.3388, -121.8914],
      "name": "San Jose, United States"
    }, {
      "latLng": [34.6833, 135.5167],
      "name": "Osaka, Japan"
    }, {
      "latLng": [34.0544, -118.244],
      "name": "Los Angeles, United States"
    }, {
      "latLng": [1.2931, 103.8558],
      "name": "Singapore, Singapore"
    }, {
      "latLng": [42.3646, -71.1028],
      "name": "Cambridge, United States"
    }, {
      "latLng": [53.3331, -6.2489],
      "name": "Dublin, Ireland"
    }, {
      "latLng": [1.2931, 103.8558],
      "name": "Singapore, Singapore"
    }, {
      "latLng": [39.9288, 116.3889],
      "name": "Beijing, China"
    }, {
      "latLng": [34.6833, 135.5167],
      "name": "Osaka, Japan"
    }, {
      "latLng": [39.0481, -77.4728],
      "name": "Ashburn, United States"
    }, {
      "latLng": [34.0544, -118.244],
      "name": "Los Angeles, United States"
    }, {
      "latLng": [10.5, -66.9167],
      "name": "Caracas, Venezuela"
    }, {
      "latLng": [26.1517, 119.9478],
      "name": "Changtanwo, Taiwan"
    }, {
      "latLng": [39.0481, -77.4728],
      "name": "Ashburn, United States"
    }, {
      "latLng": [40.7035, -73.9235],
      "name": "Brooklyn, United States"
    }, {
      "latLng": [35.685, 139.7514],
      "name": "Tokyo, Japan"
    }, {
      "latLng": [43.2565, 76.9285],
      "name": "Almaty, Kazakhstan"
    }, {
      "latLng": [35.685, 139.7514],
      "name": "Tokyo, Japan"
    }, {
      "latLng": [51.5142, -0.0931],
      "name": "London, United Kingdom"
    }, {
      "latLng": [38.6582, -77.2497],
      "name": "None, United States"
    }, {
      "latLng": [35.685, 139.7514],
      "name": "Tokyo, Japan"
    }, {
      "latLng": [30.2936, 120.1614],
      "name": "Hangzhou, China"
    }, {
      "latLng": [35.685, 139.7514],
      "name": "Tokyo, Japan"
    }, {
      "latLng": [39.0481, -77.4728],
      "name": "Ashburn, United States"
    }, {
      "latLng": [34.6833, 135.5167],
      "name": "Osaka, Japan"
    }, {
      "latLng": [30.2936, 120.1614],
      "name": "None, China"
    }, {
      "latLng": [25.3797, 112.0919],
      "name": "Hebei, China"
    }, {
      "latLng": [34.6833, 135.5167],
      "name": "Osaka, Japan"
    }, {
      "latLng": [39.0481, -77.4728],
      "name": "Ashburn, United States"
    }, {
      "latLng": [35.4034, -80.8611],
      "name": "Huntersville, United States"
    }, {
      "latLng": [37.9809, -122.3332],
      "name": "San Pablo, United States"
    }, {
      "latLng": [53.3331, -6.2489],
      "name": "Dublin, Ireland"
    }, {
      "latLng": [50.8667, -1.8667],
      "name": "Verwood, United Kingdom"
    }, {
      "latLng": [53.3331, -6.2489],
      "name": "Dublin, Ireland"
    }, {
      "latLng": [39.0481, -77.4728],
      "name": "Ashburn, United States"
    }, {
      "latLng": [41.8919, 12.5113],
      "name": "Rome, Italy"
    }, {
      "latLng": [34.6833, 135.5167],
      "name": "Osaka, Japan"
    }, {
      "latLng": [50.1153, 8.6823],
      "name": "Frankfurt am Main, Germany"
    }, {
      "latLng": [54.15, -3.1667],
      "name": "Dalton in Furness, United Kingdom"
    }, {
      "latLng": [31.3041, 120.5954],
      "name": "Suzhou, China"
    }, {
      "latLng": [42.3646, -71.1028],
      "name": "Cambridge, United States"
    }, {
      "latLng": [40.4167, -3.6837999999999997],
      "name": "Madrid, Spain"
    }, {
      "latLng": [39.0481, -77.4728],
      "name": "Ashburn, United States"
    }, {
      "latLng": [40.7357, -74.1724],
      "name": "Newark, United States"
    }, {
      "latLng": [1.2931, 103.8558],
      "name": "Singapore, Singapore"
    }, {
      "latLng": [37.3388, -121.8914],
      "name": "San Jose, United States"
    }, {
      "latLng": [-8.8368, 13.2332],
      "name": "Luanda, Angola"
    }, {
      "latLng": [37.3388, -121.8914],
      "name": "San Jose, United States"
    }, {
      "latLng": [35.685, 139.7514],
      "name": "Tokyo, Japan"
    }, {
      "latLng": [40.9521, -73.7382],
      "name": "Mamaroneck, United States"
    }, {
      "latLng": [35.685, 139.7514],
      "name": "Tokyo, Japan"
    }, {
      "latLng": [25.0478, 121.5318],
      "name": "Taipei, Taiwan"
    }, {
      "latLng": [-23.5733, -46.6417],
      "name": "S\u00e3o Paulo, Brazil"
    }, {
      "latLng": [53.3331, -6.2489],
      "name": "Dublin, Ireland"
    }, {
      "latLng": [-23.5733, -46.6417],
      "name": "S\u00e3o Paulo, Brazil"
    }, {
      "latLng": [30.6667, 104.0667],
      "name": "None, China"
    }, {
      "latLng": [35.685, 139.7514],
      "name": "Tokyo, Japan"
    }, {
      "latLng": [39.0481, -77.4728],
      "name": "Ashburn, United States"
    }, {
      "latLng": [39.0481, -77.4728],
      "name": "Ashburn, United States"
    }, {
      "latLng": [-12.5, 18.5],
      "name": "None, Angola"
    }, {
      "latLng": [1.2931, 103.8558],
      "name": "Singapore, Singapore"
    }, {
      "latLng": [34.6833, 135.5167],
      "name": "Osaka, Japan"
    }, {
      "latLng": [-23.5733, -46.6417],
      "name": "S\u00e3o Paulo, Brazil"
    }, {
      "latLng": [-23.5667, -46.7833],
      "name": "Osasco, Brazil"
    }, {
      "latLng": [39.0481, -77.4728],
      "name": "Ashburn, United States"
    }, {
      "latLng": [42.3751, -71.1056],
      "name": "Cambridge, United States"
    }, {
      "latLng": [39.0481, -77.4728],
      "name": "Ashburn, United States"
    }, {
      "latLng": [39.0481, -77.4728],
      "name": "Ashburn, United States"
    }, {
      "latLng": [34.6833, 135.5167],
      "name": "Osaka, Japan"
    }, {
      "latLng": [-23.5733, -46.6417],
      "name": "S\u00e3o Paulo, Brazil"
    }, {
      "latLng": [51.5142, -0.0931],
      "name": "London, United Kingdom"
    }, {
      "latLng": [34.6833, 135.5167],
      "name": "Osaka, Japan"
    }, {
      "latLng": [53.3331, -6.2489],
      "name": "Dublin, Ireland"
    }, {
      "latLng": [42.4247, -71.1112],
      "name": "Medford, United States"
    }, {
      "latLng": [39.0481, -77.4728],
      "name": "Ashburn, United States"
    }, {
      "latLng": [30.2936, 120.1614],
      "name": "Hangzhou, China"
    }, {
      "latLng": [53.3331, -6.2489],
      "name": "Dublin, Ireland"
    }, {
      "latLng": [-34.6033, -58.3816],
      "name": "Buenos Aires, Argentina"
    }, {
      "latLng": [-8.8368, 13.2332],
      "name": "Luanda, Angola"
    }, {
      "latLng": [35.685, 139.7514],
      "name": "Tokyo, Japan"
    }, {
      "latLng": [41.8919, 12.5113],
      "name": "Rome, Italy"
    }, {
      "latLng": [53.3331, -6.2489],
      "name": "Dublin, Ireland"
    }, {
      "latLng": [39.0481, -77.4728],
      "name": "Ashburn, United States"
    }, {
      "latLng": [35.685, 139.7514],
      "name": "Tokyo, Japan"
    }, {
      "latLng": [37.751, -97.822],
      "name": "None, United States"
    }, {
      "latLng": [39.0481, -77.4728],
      "name": "Ashburn, United States"
    }, {
      "latLng": [40.7357, -74.1724],
      "name": "Newark, United States"
    }, {
      "latLng": [-23.5733, -46.6417],
      "name": "S\u00e3o Paulo, Brazil"
    }, {
      "latLng": [34.6833, 135.5167],
      "name": "Osaka, Japan"
    }, {
      "latLng": [45.5801, 9.2725],
      "name": "Monza, Italy"
    }, {
      "latLng": [35.0484, -82.0852],
      "name": "Inman, United States"
    }, {
      "latLng": [-12.5, 18.5],
      "name": "None, Angola"
    }, {
      "latLng": [1.2931, 103.8558],
      "name": "Singapore, Singapore"
    }, {
      "latLng": [39.0481, -77.4728],
      "name": "Ashburn, United States"
    }, {
      "latLng": [40.0217, -75.0518],
      "name": "Philadelphia, United States"
    }, {
      "latLng": [20.4167, 106.1667],
      "name": "Nam \u0110\u1ecbnh, Vietnam"
    }, {
      "latLng": [53.3331, -6.2489],
      "name": "Dublin, Ireland"
    }, {
      "latLng": [55.8376, -4.2843],
      "name": "Glasgow, United Kingdom"
    }, {
      "latLng": [39.9288, 116.3889],
      "name": "Beijing, China"
    }, {
      "latLng": [39.9289, 116.3883],
      "name": "None, China"
    }, {
      "latLng": [39.0481, -77.4728],
      "name": "Ashburn, United States"
    }, {
      "latLng": [34.0544, -118.244],
      "name": "Los Angeles, United States"
    }, {
      "latLng": [1.2931, 103.8558],
      "name": "Singapore, Singapore"
    }, {
      "latLng": [-34.6033, -58.3816],
      "name": "Buenos Aires, Argentina"
    }, {
      "latLng": [53.3331, -6.2489],
      "name": "Dublin, Ireland"
    }, {
      "latLng": [59.3333, 18.05],
      "name": "Stockholm, Sweden"
    }, {
      "latLng": [31.0456, 121.3997],
      "name": "Shanghai, China"
    }, {
      "latLng": [22.5333, 114.1333],
      "name": "Shenzhen, China"
    }, {
      "latLng": [53.3331, -6.2489],
      "name": "Dublin, Ireland"
    }, {
      "latLng": [47.6062, -122.3321],
      "name": "Seattle, United States"
    }, {
      "latLng": [40.7518, -74.0662],
      "name": "Jersey City, United States"
    }, {
      "latLng": [39.0481, -77.4728],
      "name": "Ashburn, United States"
    }, {
      "latLng": [34.6833, 135.5167],
      "name": "Osaka, Japan"
    }, {
      "latLng": [39.9289, 116.3883],
      "name": "None, China"
    }, {
      "latLng": [53.3331, -6.2489],
      "name": "Dublin, Ireland"
    }, {
      "latLng": [25.7741, -80.1817],
      "name": "Miami, United States"
    }, {
      "latLng": [39.0481, -77.4728],
      "name": "Ashburn, United States"
    }, {
      "latLng": [45.8696, -119.688],
      "name": "Boardman, United States"
    }, {
      "latLng": [35.685, 139.7514],
      "name": "Tokyo, Japan"
    }, {
      "latLng": [34.6833, 135.5167],
      "name": "Osaka, Japan"
    }, {
      "latLng": [39.9288, 116.3889],
      "name": "Beijing, China"
    }, {
      "latLng": [39.0481, -77.4728],
      "name": "Ashburn, United States"
    }, {
      "latLng": [48.15, 17.1167],
      "name": "Bratislava, Slovakia"
    }, {
      "latLng": [40.4165, -3.7026],
      "name": "Madrid, Spain"
    }, {
      "latLng": [1.3667, 103.8],
      "name": "None, Singapore"
    }, {
      "latLng": [47.6344, -122.3422],
      "name": "Seattle, United States"
    }, {
      "latLng": [50.1153, 8.6823],
      "name": "Frankfurt am Main, Germany"
    }, {
      "latLng": [35.685, 139.7514],
      "name": "Tokyo, Japan"
    }, {
      "latLng": [37.3388, -121.8914],
      "name": "San Jose, United States"
    }, {
      "latLng": [35.685, 139.7514],
      "name": "Tokyo, Japan"
    }, {
      "latLng": [53.3331, -6.2489],
      "name": "Dublin, Ireland"
    }, {
      "latLng": [-23.5733, -46.6417],
      "name": "S\u00e3o Paulo, Brazil"
    }, {
      "latLng": [34.6833, 135.5167],
      "name": "Osaka, Japan"
    }, {
      "latLng": [53.3331, -6.2489],
      "name": "Dublin, Ireland"
    }, {
      "latLng": [39.0481, -77.4728],
      "name": "Ashburn, United States"
    }, {
      "latLng": [-34.7689, -58.6471],
      "name": "Gonzalez Catan, Argentina"
    }, {
      "latLng": [53.3331, -6.2489],
      "name": "Dublin, Ireland"
    }, {
      "latLng": [34.6833, 135.5167],
      "name": "Osaka, Japan"
    }, {
      "latLng": [1.2931, 103.8558],
      "name": "Singapore, Singapore"
    }, {
      "latLng": [35.685, 139.7514],
      "name": "Tokyo, Japan"
    }, {
      "latLng": [55.7237, 12.44],
      "name": "Herlev, Denmark"
    }, {
      "latLng": [39.0481, -77.4728],
      "name": "Ashburn, United States"
    }, {
      "latLng": [39.0481, -77.4728],
      "name": "Ashburn, United States"
    }, {
      "latLng": [1.2931, 103.8558],
      "name": "Singapore, Singapore"
    }, {
      "latLng": [39.0481, -77.4728],
      "name": "Ashburn, United States"
    }, {
      "latLng": [1.2931, 103.8558],
      "name": "Singapore, Singapore"
    }
  ];

  var isoCountries = {
    'Afghanistan': 'AF',
    'Aland Islands': 'AX',
    'Albania': 'AL',
    'Algeria': 'DZ',
    'American Samoa': 'AS',
    'Andorra': 'AD',
    'Angola': 'AO',
    'Anguilla': 'AI',
    'Antarctica': 'AQ',
    'Antigua And Barbuda': 'AG',
    'Argentina': 'AR',
    'Armenia': 'AM',
    'Aruba': 'AW',
    'Australia': 'AU',
    'Austria': 'AT',
    'Azerbaijan': 'AZ',
    'Bahamas': 'BS',
    'Bahrain': 'BH',
    'Bangladesh': 'BD',
    'Barbados': 'BB',
    'Belarus': 'BY',
    'Belgium': 'BE',
    'Belize': 'BZ',
    'Benin': 'BJ',
    'Bermuda': 'BM',
    'Bhutan': 'BT',
    'Bolivia': 'BO',
    'Bosnia And Herzegovina': 'BA',
    'Botswana': 'BW',
    'Bouvet Island': 'BV',
    'Brazil': 'BR',
    'British Indian Ocean Territory': 'IO',
    'Brunei Darussalam': 'BN',
    'Bulgaria': 'BG',
    'Burkina Faso': 'BF',
    'Burundi': 'BI',
    'Cambodia': 'KH',
    'Cameroon': 'CM',
    'Canada': 'CA',
    'Cape Verde': 'CV',
    'Cayman Islands': 'KY',
    'Central African Republic': 'CF',
    'Chad': 'TD',
    'Chile': 'CL',
    'China': 'CN',
    'Christmas Island': 'CX',
    'Cocos (Keeling) Islands': 'CC',
    'Colombia': 'CO',
    'Comoros': 'KM',
    'Congo': 'CG',
    'Congo, Democratic Republic': 'CD',
    'Cook Islands': 'CK',
    'Costa Rica': 'CR',
    'Cote D\'Ivoire': 'CI',
    'Croatia': 'HR',
    'Cuba': 'CU',
    'Cyprus': 'CY',
    'Czech Republic': 'CZ',
    'Denmark': 'DK',
    'Djibouti': 'DJ',
    'Dominica': 'DM',
    'Dominican Republic': 'DO',
    'Ecuador': 'EC',
    'Egypt': 'EG',
    'El Salvador': 'SV',
    'Equatorial Guinea': 'GQ',
    'Eritrea': 'ER',
    'Estonia': 'EE',
    'Ethiopia': 'ET',
    'Falkland Islands': 'FK',
    'Faroe Islands': 'FO',
    'Fiji': 'FJ',
    'Finland': 'FI',
    'France': 'FR',
    'French Guiana': 'GF',
    'French Polynesia': 'PF',
    'French Southern Territories': 'TF',
    'Gabon': 'GA',
    'Gambia': 'GM',
    'Georgia': 'GE',
    'Germany': 'DE',
    'Ghana': 'GH',
    'Gibraltar': 'GI',
    'Greece': 'GR',
    'Greenland': 'GL',
    'Grenada': 'GD',
    'Guadeloupe': 'GP',
    'Guam': 'GU',
    'Guatemala': 'GT',
    'Guernsey': 'GG',
    'Guinea': 'GN',
    'Guinea-Bissau': 'GW',
    'Guyana': 'GY',
    'Haiti': 'HT',
    'Heard Island & Mcdonald Islands': 'HM',
    'Holy See (Vatican City State)': 'VA',
    'Honduras': 'HN',
    'Hong Kong': 'HK',
    'Hungary': 'HU',
    'Iceland': 'IS',
    'India': 'IN',
    'Indonesia': 'ID',
    'Iran, Islamic Republic Of': 'IR',
    'Iraq': 'IQ',
    'Ireland': 'IE',
    'Isle Of Man': 'IM',
    'Israel': 'IL',
    'Italy': 'IT',
    'Jamaica': 'JM',
    'Japan': 'JP',
    'Jersey': 'JE',
    'Jordan': 'JO',
    'Kazakhstan': 'KZ',
    'Kenya': 'KE',
    'Kiribati': 'KI',
    'Korea': 'KR',
    'Kuwait': 'KW',
    'Kyrgyzstan': 'KG',
    'Lao People\'s Democratic Republic': 'LA',
    'Latvia': 'LV',
    'Lebanon': 'LB',
    'Lesotho': 'LS',
    'Liberia': 'LR',
    'Libyan Arab Jamahiriya': 'LY',
    'Liechtenstein': 'LI',
    'Lithuania': 'LT',
    'Luxembourg': 'LU',
    'Macao': 'MO',
    'Macedonia': 'MK',
    'Madagascar': 'MG',
    'Malawi': 'MW',
    'Malaysia': 'MY',
    'Maldives': 'MV',
    'Mali': 'ML',
    'Malta': 'MT',
    'Marshall Islands': 'MH',
    'Martinique': 'MQ',
    'Mauritania': 'MR',
    'Mauritius': 'MU',
    'Mayotte': 'YT',
    'Mexico': 'MX',
    'Micronesia, Federated States Of': 'FM',
    'Moldova': 'MD',
    'Monaco': 'MC',
    'Mongolia': 'MN',
    'Montenegro': 'ME',
    'Montserrat': 'MS',
    'Morocco': 'MA',
    'Mozambique': 'MZ',
    'Myanmar': 'MM',
    'Namibia': 'NA',
    'Nauru': 'NR',
    'Nepal': 'NP',
    'Netherlands': 'NL',
    'Netherlands Antilles': 'AN',
    'New Caledonia': 'NC',
    'New Zealand': 'NZ',
    'Nicaragua': 'NI',
    'Niger': 'NE',
    'Nigeria': 'NG',
    'Niue': 'NU',
    'Norfolk Island': 'NF',
    'Northern Mariana Islands': 'MP',
    'Norway': 'NO',
    'Oman': 'OM',
    'Pakistan': 'PK',
    'Palau': 'PW',
    'Palestinian Territory, Occupied': 'PS',
    'Panama': 'PA',
    'Papua New Guinea': 'PG',
    'Paraguay': 'PY',
    'Peru': 'PE',
    'Philippines': 'PH',
    'Pitcairn': 'PN',
    'Poland': 'PL',
    'Portugal': 'PT',
    'Puerto Rico': 'PR',
    'Qatar': 'QA',
    'Reunion': 'RE',
    'Romania': 'RO',
    'Russian Federation': 'RU',
    'Rwanda': 'RW',
    'Saint Barthelemy': 'BL',
    'Saint Helena': 'SH',
    'Saint Kitts And Nevis': 'KN',
    'Saint Lucia': 'LC',
    'Saint Martin': 'MF',
    'Saint Pierre And Miquelon': 'PM',
    'Saint Vincent And Grenadines': 'VC',
    'Samoa': 'WS',
    'San Marino': 'SM',
    'Sao Tome And Principe': 'ST',
    'Saudi Arabia': 'SA',
    'Senegal': 'SN',
    'Serbia': 'RS',
    'Seychelles': 'SC',
    'Sierra Leone': 'SL',
    'Singapore': 'SG',
    'Slovakia': 'SK',
    'Slovenia': 'SI',
    'Solomon Islands': 'SB',
    'Somalia': 'SO',
    'South Africa': 'ZA',
    'South Georgia And Sandwich Isl.': 'GS',
    'Spain': 'ES',
    'Sri Lanka': 'LK',
    'Sudan': 'SD',
    'Suriname': 'SR',
    'Svalbard And Jan Mayen': 'SJ',
    'Swaziland': 'SZ',
    'Sweden': 'SE',
    'Switzerland': 'CH',
    'Syrian Arab Republic': 'SY',
    'Taiwan': 'TW',
    'Tajikistan': 'TJ',
    'Tanzania': 'TZ',
    'Thailand': 'TH',
    'Timor-Leste': 'TL',
    'Togo': 'TG',
    'Tokelau': 'TK',
    'Tonga': 'TO',
    'Trinidad And Tobago': 'TT',
    'Tunisia': 'TN',
    'Turkey': 'TR',
    'Turkmenistan': 'TM',
    'Turks And Caicos Islands': 'TC',
    'Tuvalu': 'TV',
    'Uganda': 'UG',
    'Ukraine': 'UA',
    'United Arab Emirates': 'AE',
    'United Kingdom': 'GB',
    'United States': 'US',
    'United States Outlying Islands': 'UM',
    'Uruguay': 'UY',
    'Uzbekistan': 'UZ',
    'Vanuatu': 'VU',
    'Venezuela': 'VE',
    'Vietnam': 'VN',
    'Virgin Islands, British': 'VG',
    'Virgin Islands, U.S.': 'VI',
    'Wallis And Futuna': 'WF',
    'Western Sahara': 'EH',
    'Yemen': 'YE',
    'Zambia': 'ZM',
    'Zimbabwe': 'ZW'
  };


  function getCountryCode (countryName) {
    if (isoCountries.hasOwnProperty(countryName)) {
        return isoCountries[countryName];
    } else {
        return countryName;
    }
  }

  const config = {
    map: 'world_mill',
    backgroundColor: '#fff',
    borderColor: '#fff',
    borderOpacity: 0.25,
    borderWidth: 0,
    color: '#e6e6e6',
    regionStyle: {
      initial: {
        fill: '#e4ecef',
      },
    },
    markerStyle: {
      initial: {
        r: 7,
        fill: '#fff',
        'fill-opacity': 1,
        stroke: '#000',
        'stroke-width': 2,
        'stroke-opacity': 0.4,
      },
    },
    series: {
      regions: [
        {
          scale: ['#C8EEFF', '#0071A4'],
          normalizeFunction: 'polynomial',
        },
      ],
    },
    hoverOpacity: null,
    normalizeFunction: 'linear',
    zoomOnScroll: false,
    scaleColors: ['#b6d6ff', '#005ace'],
    selectedColor: '#c9dfaf',
    selectedRegions: [],
    enableZoom: false,
    hoverColor: '#fff',
  };

  const handleNodes = peers => {
    const numNodes = peers.length;
    config.markers = peers;
    let nodesPerCountry = {};

    // Count unique countries by country code
    for (var i = 0; i < numNodes; i++) {
      const countryname = peers[i].name.split(',')[1].trim();
      const countryCode = getCountryCode(countryname);
      nodesPerCountry[countryCode] = 1 + (nodesPerCountry[countryCode] || 0);
    }

    // update map config with node counts per country
    config.series.regions[0].values = nodesPerCountry;
    vectorMapInit();
  };

  const vectorMapInit = () => {
    if ($('#world-map-marker').length > 0) {
      // This is a hack, as the .empty() did not do the work
      $('#vmap').remove();
      // we recreate (after removing it) the container div, to reset all the data of the map
      $('#world-map-marker').append(`
          <div
            id="vmap"
            style="
              height: 490px;
              position: relative;
              overflow: hidden;
              background-color: transparent;
            "
          >
          </div>
        `);

      $('#vmap').vectorMap(config);
    }
  };
  handleNodes(peers)
});
