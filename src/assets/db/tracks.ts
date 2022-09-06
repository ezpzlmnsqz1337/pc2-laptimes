import { v4 as uuidv4 } from 'uuid'

export interface Track {
  uid: string,
  track: string,
  variants: string[]
  gameId?: string
}

export const tracks: Track[] = [
  {
    uid: uuidv4(),
    track: 'Autodromo Internacional Algarve (Portugal)',
    variants: [
      'Grand Prix Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Autodromo Nazionale Monza (Italy)',
    variants: [
      'Grand Prix Circuit',
      'Historic Combined Circuit',
      'Historic Grand Prix Circuit',
      'Historic Oval Circuit',
      'Short Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Azure Circuit (France)',
    variants: [
      'Grand Prix Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Azure Coast (France)',
    variants: [
      'Eastbound Point to Point',
      'Stage 1 Point to Point',
      'Stage 2 Point to Point',
      'Stage 3 Point to Point',
      'Westbound Point to Point'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Bannochbrae (Scotland)',
    variants: [
      'Road Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Bathurst - Mount Panorama Motor Racing Circuit (Australia)',
    variants: [
      'Grand Prix Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Brands Hatch (United Kingdom)',
    variants: [
      'Grand Prix Circuit',
      'Indy Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Brno (Czech Republic)',
    variants: [
      'Grand Prix Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Cadwell Park (United Kingdom)',
    variants: [
      'Club Circuit',
      'Grand Prix Circuit',
      'Woodland Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'California Highway (USA)',
    variants: [
      'Northbound Point to Point',
      'Southbound Point to Point',
      'Stage 1 Point to Point',
      'Stage 2 Point to Point',
      'Stage 3 Point to Point'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Chesterfield Karting Circuit (United Kingdom)',
    variants: [
      'Grand Prix Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Circuit de Barcelona-Catalunya (Spain)',
    variants: [
      'Club Circuit',
      'Grand Prix Circuit',
      'National Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Circuit de Spa-Francorchamps (Belgium)',
    variants: [
      'Grand Prix Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Circuit of the Americas (USA)',
    variants: [
      'Grand Prix Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Daytona International Speedway (USA)',
    variants: [
      'RallyCross Circuit',
      'Road Course Circuit',
      'Tri-Oval Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Dirtfish Rally School (USA)',
    variants: [
      'RallyCross Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Donington (United Kingdom)',
    variants: [
      'Grand Prix Circuit',
      'National Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Dubai Autodrome (United Arab Emirates)',
    variants: [
      'Club Circuit',
      'Grand Prix Circuit',
      'International Circuit',
      'Karting Circuit',
      'National Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Fuji Speedway (Japan)',
    variants: [
      'Grand Prix Circuit']
  },
  {
    uid: uuidv4(),
    track: 'Glencairn Karting Circuit (United Kingdom)',
    variants: [
      'East Circuit',
      'East Reverse Circuit',
      'Grand Prix Circuit',
      'Reverse Circuit',
      'West Circuit',
      'West Reverse Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Greenwood Karting Circuit (Ireland)',
    variants: [
      'Grand Prix Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Hockenheimring (Germany)',
    variants: [
      'Classic Circuit',
      'Grand Prix Circuit',
      'National Circuit',
      'RallyCross Circuit',
      'Short Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Imola - Autodromo Internazionale Enzo e Dino Ferrari (Italy)',
    variants: [
      'Grand Prix Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Indianapolis Motor Speedway (USA)',
    variants: [
      'Road Course Circuit',
      'Speedway Oval Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Knockhill Racing Circuit (Scotland)',
    variants: [
      'International Reverse Circuit',
      'RallyCross Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Lankebanen - Hell (Norway)',
    variants: [
      'RallyCross Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Le Mans - Circuit de la Sarthe (France)',
    variants: [
      'Bugatti Circuit',
      'Circuit de 24 Heures du Mans']
  },
  {
    uid: uuidv4(),
    track: 'Loheac-Bretagna (France)',
    variants: [
      'RallyCross Circuit']
  },
  {
    uid: uuidv4(),
    track: 'Long Beach (USA)',
    variants: [
      'Grand Prix Circuit']
  },
  {
    uid: uuidv4(),
    track: 'Lydden Hill (UK)',
    variants: [
      'Grand Prix Circuit',
      'RallyCross Circuit'
    ]
  },

  {
    uid: uuidv4(),
    track: 'Mazda Raceway Laguna Seca (USA)',
    variants: [
      'Grand Prix Circuit'
    ]
  },

  {
    uid: uuidv4(),
    track: 'Mercedes-Benz Ice Track (Sweden)',
    variants: [
      'East Circuit',
      'North Circuit',
      'South Circuit',
      'West Circuit'
    ]

  },
  {
    uid: uuidv4(),
    track: 'Mojave (USA)',
    variants: [
      'Boa Ascent Circuit',
      'Cougar Ridge Circuit',
      'Coyote Noose Circuit',
      'Gila Crest Circuit',
      'Sidewinder Circuit',
      'Test Track'
    ]

  },
  {
    uid: uuidv4(),
    track: 'Nurburgring (Germany)',
    variants: [
      'Grand Prix Circuit',
      'Muellenbach Circuit',
      'Nordschleife Circuit',
      'Nordschleife 24 Hour Circuit',
      'Nordschleife Stage 1 Point to Point',
      'Nordschleife Stage 2 Point to Point',
      'Nordschleife Stage 3 Point to Point',
      'Sprint Circuit',
      'Sprint Short Circuit'
    ]

  },
  {
    uid: uuidv4(),
    track: 'Oschersleben Motorsport Arena (Germany)',
    variants: [
      'C Circuit',
      'Grand Prix Circuit',
      'National Circuit'
    ]

  },
  {
    uid: uuidv4(),
    track: 'Oulton Park (United Kingdom)',
    variants: [
      'Fosters Circuit',
      'International Circuit',
      'Island Circuit'
    ]
  },

  {
    uid: uuidv4(),
    track: 'Red Bull Ring (Austria)',
    variants: [
      'Club Circuit',
      'Grand Prix Circuit',
      'National Circuit'
    ]

  },
  {
    uid: uuidv4(),
    track: 'Road America (USA)',
    variants: [
      'Grand Prix Circuit'
    ]

  },
  {
    uid: uuidv4(),
    track: 'Rouen Les Essarts (France)',
    variants: [
      'Grand Prix Circuit',
      'Short Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Ruapuna Park International Raceway (New Zealand)',
    variants: [
      'A Circuit',
      'B Circuit',
      'Club Circuit',
      'Grand Prix Circuit',
      'Outer Loop Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Sakitto (Japan)',
    variants: [
      'Grand Prix Circuit',
      'International Circuit',
      'National Circuit',
      'Sprint Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Sampala Circuit (Canada)',
    variants: ['Grand Prix Circuit']
  },
  {
    uid: uuidv4(),
    track: 'Silverstone (United Kingdom)',
    variants: [
      'Classic Circuit',
      'Grand Prix Circuit',
      'International Circuit',
      'National Circuit',
      'Stowe Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Snetterton (United Kingdom)',
    variants: [
      '100 Circuit',
      '200 Circuit',
      '300 Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Sonoma Raceway (USA)',
    variants: [
      'Grand Prix Circuit',
      'National Circuit',
      'Short Circuit'
    ]
  },
  {
    uid: uuidv4(),
    track: 'Sportsland SUGO (Japan)',
    variants: ['Grand Prix Circuit']
  }
]
