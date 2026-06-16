import { PROGRAM_DAY_ORDER } from "@/lib/festival-config"

export interface Artist {
  id: string
  name: string
  startTime: string
  endTime: string
  stage: string
  day?: string // legacy
  startDay?: string
  endDay?: string
}

// Helper: tijd naar minuten
function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export interface Stage {
  id: string
  name: string
  color: string
}

export interface Day {
  id: string
  name: string
  date: string
}

export const days: Day[] = [
  { id: "wednesday", name: "Wednesday", date: "2026-06-17" },
  { id: "thursday", name: "Thursday", date: "2026-06-18" },
  { id: "friday", name: "Friday", date: "2026-06-19" },
  { id: "saturday", name: "Saturday", date: "2026-06-20" },
  { id: "sunday", name: "Sunday", date: "2026-06-21" },
  { id: "monday", name: "Monday", date: "2026-06-22" },
]

export const stages: Stage[] = [
  { id: "Floresta", name: "Floresta", color: "#8b5cf6" },
  { id: "Praia", name: "Praia", color: "#06b6d4" },
  { id: "Outro Lado", name: "Outro Lado", color: "#10b981" },
  { id: "Mimo", name: "Mimo", color: "#f59e0b" },
  { id: "Cochilo", name: "Cochilo", color: "#84cc16" },
]

// Helper to generate time slots
function timeAdd(start: string, mins: number) {
  const [h, m] = start.split(":").map(Number)
  const date = new Date(2000, 0, 1, h, m)
  date.setMinutes(date.getMinutes() + mins)
  return date.toTimeString().slice(0, 5)
}

// Helper om oude 'day' veld te mappen naar startDay en endDay
function mapLegacyDays(artists: Artist[]): Artist[] {
  return artists.map((artist) => {
    if (!artist.startDay && artist.day) {
      // Determine if the artist goes through the 0000h point
      const startHour = parseInt(artist.startTime.split(':')[0]);
      const endHour = parseInt(artist.endTime.split(':')[0]);

      // If the artist goes through the 0000h point, they end on the next day
      let endDay = artist.day;
      if (endHour < startHour) {
        // Determine the endDay
        const currentDayIndex = PROGRAM_DAY_ORDER.indexOf(artist.day as typeof PROGRAM_DAY_ORDER[number]);
        if (currentDayIndex !== -1 && currentDayIndex < PROGRAM_DAY_ORDER.length - 1) {
          endDay = PROGRAM_DAY_ORDER[currentDayIndex + 1];
        }
      }
      
      return {
        ...artist,
        startDay: artist.day,
        endDay: endDay,
      };
    }
    return artist;
  });
}

export const timetable: Artist[] = mapLegacyDays([
  {
    "id":"1",
    "name":"Paquita Gordon",
    "startTime":"21:00",
    "endTime":"02:00",
    "stage":"Floresta",
    "day":"wednesday"
  },
  {
    "id":"2",
    "name":"Theo Parrish",
    "startTime":"02:00",
    "endTime":"10:00",
    "stage":"Floresta",
    "day":"thursday"
  },
 
  {
    "id":"4",
    "name":"Francisca Urbano & Lamaz",
    "startTime":"14:00",
    "endTime":"17:00",
    "stage":"Floresta",
    "day":"friday"
  },
  {
    "id":"5",
    "name":"Dj Fart in the Club",
    "startTime":"17:00",
    "endTime":"20:00",
    "stage":"Floresta",
    "day":"friday"
  },
  {
    "id":"6",
    "name":"Verraco",
    "startTime":"20:00",
    "endTime":"23:00",
    "stage":"Floresta",
    "day":"friday"
  },
  {
    "id":"7",
    "name":"Lournco Lvgs",
    "startTime":"14:00",
    "endTime":"17:00",
    "stage":"Floresta",
    "day":"thursday"
  },
  {
    "id":"8",
    "name":"Octo Octa & Eris Drew",
    "startTime":"17:00",
    "endTime":"21:00",
    "stage":"Floresta",
    "day":"thursday"
  },
  {
    "id":"9",
    "name":"Nathalie Seres & Introspekt",
    "startTime":"21:00",
    "endTime":"00:00",
    "stage":"Floresta",
    "day":"thursday"
  },
  {
    "id":"10",
    "name":"Pearson Sound",
    "startTime":"00:00",
    "endTime":"03:00",
    "stage":"Floresta",
    "day":"friday"
  },
  {
    "id":"11",
    "name":"Lena Willikens",
    "startTime":"03:00",
    "endTime":"06:00",
    "stage":"Floresta",
    "day":"friday"
  },
  {
    "id":"12",
    "name":"Djrum",
    "startTime":"06:00",
    "endTime":"10:00",
    "stage":"Floresta",
    "day":"friday"
  },
  {
    "id":"13",
    "name":"Nosedrip",
    "startTime":"23:00",
    "endTime":"03:00",
    "stage":"Floresta",
    "day":"saturday"
  },
  {
    "id":"14",
    "name":"Dj Red",
    "startTime":"03:00",
    "endTime":"07:00",
    "stage":"Floresta",
    "day":"saturday"
  },
  {
    "id":"15",
    "name":"Jane Fitz",
    "startTime":"07:00",
    "endTime":"10:00",
    "stage":"Floresta",
    "day":"saturday"
  },
 
  {
    "id":"17",
    "name":"Que Sakamoto",
    "startTime":"14:00",
    "endTime":"17:00",
    "stage":"Floresta",
    "day":"saturday"
  },
  {
    "id":"18",
    "name":"Rhadoo",
    "startTime":"17:00",
    "endTime":"23:00",
    "stage":"Floresta",
    "day":"saturday"
  },
  {
    "id":"19",
    "name":"Loidis",
    "startTime":"23:00",
    "endTime":"02:00",
    "stage":"Floresta",
    "day":"saturday"
  },
  {
    "id":"20",
    "name":"Roman Flügel pres. Tracks On Delivery",
    "startTime":"02:00",
    "endTime":"03:00",
    "stage":"Floresta",
    "day":"sunday"
  },
  {
    "id":"21",
    "name":"Maayan Nidam",
    "startTime":"03:00",
    "endTime":"07:00",
    "stage":"Floresta",
    "day":"sunday"
  },
  {
    "id":"22",
    "name":"Kia",
    "startTime":"07:00",
    "endTime":"10:00",
    "stage":"Floresta",
    "day":"sunday"
  },
  
  {
    "id":"24",
    "name":"Altinbas",
    "startTime":"14:00",
    "endTime":"17:00",
    "stage":"Floresta",
    "day":"sunday"
  },
  {
    "id":"25",
    "name":"David Rodrigues",
    "startTime":"17:00",
    "endTime":"20:00",
    "stage":"Floresta",
    "day":"sunday"
  },
  {
    "id":"26",
    "name":"Magda",
    "startTime":"20:00",
    "endTime":"23:00",
    "stage":"Floresta",
    "day":"sunday"
  },
  {
    "id":"27",
    "name":"DVS1",
    "startTime":"23:00",
    "endTime":"02:00",
    "stage":"Floresta",
    "day":"sunday"
  },
  {
    "id":"28",
    "name":"Polygonia",
    "startTime":"02:00",
    "endTime":"05:00",
    "stage":"Floresta",
    "day":"monday"
  },
  {
    "id":"29",
    "name":"Vlada",
    "startTime":"05:00",
    "endTime":"08:00",
    "stage":"Floresta",
    "day":"monday"
  },
  {
    "id":"30",
    "name":"''--''",
    "startTime":"08:00",
    "endTime":"--",
    "stage":"Floresta",
    "day":"monday"
  },
  {
    "id":"31",
    "name":"Kutmah",
    "startTime":"21:00",
    "endTime":"23:00",
    "stage":"Praia",
    "day":"wednesday"
  },
  {
    "id":"32",
    "name":"Om Unit",
    "startTime":"23:00",
    "endTime":"01:00",
    "stage":"Praia",
    "day":"wednesday"
  },
  {
    "id":"33",
    "name":"DJ Marcelle",
    "startTime":"01:00",
    "endTime":"04:00",
    "stage":"Praia",
    "day":"thursday"
  },
  {
    "id":"34",
    "name":"Catu Diosis",
    "startTime":"04:00",
    "endTime":"06:00",
    "stage":"Praia",
    "day":"thursday"
  },
 
  {
    "id":"36",
    "name":"Mari.te",
    "startTime":"12:00",
    "endTime":"15:00",
    "stage":"Praia",
    "day":"thursday"
  },
  {
    "id":"37",
    "name":"Dana Kuehr",
    "startTime":"15:00",
    "endTime":"18:00",
    "stage":"Praia",
    "day":"thursday"
  },
  {
    "id":"38",
    "name":"Mark Farina",
    "startTime":"18:00",
    "endTime":"22:00",
    "stage":"Praia",
    "day":"thursday"
  },
  {
    "id":"39",
    "name":"Trol2000",
    "startTime":"22:00",
    "endTime":"01:00",
    "stage":"Praia",
    "day":"thursday"
  },
  {
    "id":"40",
    "name":"Richard Akingbehin",
    "startTime":"01:00",
    "endTime":"04:00",
    "stage":"Praia",
    "day":"friday"
  },
  {
    "id":"41",
    "name":"Yen Sung",
    "startTime":"04:00",
    "endTime":"06:00",
    "stage":"Praia",
    "day":"friday"
  },
 
  {
    "id":"43",
    "name":"Funkamente",
    "startTime":"12:00",
    "endTime":"16:00",
    "stage":"Praia",
    "day":"friday"
  },
  {
    "id":"44",
    "name":"Mike Stellar",
    "startTime":"16:00",
    "endTime":"19:30",
    "stage":"Praia",
    "day":"friday"
  },
  {
    "id":"45",
    "name":"Luke Vibert",
    "startTime":"19:30",
    "endTime":"21:00",
    "stage":"Praia",
    "day":"friday"
  },
  {
    "id":"46",
    "name":"King Kami",
    "startTime":"21:00",
    "endTime":"00:00",
    "stage":"Praia",
    "day":"friday"
  },
  {
    "id":"47",
    "name":"Dj Flight",
    "startTime":"00:00",
    "endTime":"03:00",
    "stage":"Praia",
    "day":"saturday"
  },
  {
    "id":"48",
    "name":"Doctor Jeep",
    "startTime":"03:00",
    "endTime":"06:00",
    "stage":"Praia",
    "day":"saturday"
  },
  {
    "id":"50",
    "name":"Mr Scruff",
    "startTime":"12:00",
    "endTime":"18:00",
    "stage":"Praia",
    "day":"saturday"
  },
  {
    "id":"51",
    "name":"Club CCC (CC:Disco & Dj Caring & Chima Isaaro)",
    "startTime":"18:00",
    "endTime":"00:00",
    "stage":"Praia",
    "day":"saturday"
  },
  {
    "id":"52",
    "name":"Tim Sweeney",
    "startTime":"00:00",
    "endTime":"06:00",
    "stage":"Praia",
    "day":"sunday"
  },
 
  {
    "id":"54",
    "name":"Selecta Fontes",
    "startTime":"14:00",
    "endTime":"15:20",
    "stage":"Praia",
    "day":"sunday"
  },
  {
    "id":"55",
    "name":"Medi Sound Station",
    "startTime":"15:20",
    "endTime":"16:40",
    "stage":"Praia",
    "day":"sunday"
  },
  {
    "id":"56",
    "name":"Simply Rockers Sound System",
    "startTime":"16:40",
    "endTime":"18:00",
    "stage":"Praia",
    "day":"sunday"
  },
  {
    "id":"57",
    "name":"10.000 Lions",
    "startTime":"18:00",
    "endTime":"20:00",
    "stage":"Praia",
    "day":"sunday"
  },
  {
    "id":"58",
    "name":"Simply Rockers Sound System",
    "startTime":"20:00",
    "endTime":"22:00",
    "stage":"Praia",
    "day":"sunday"
  },
  {
    "id":"59",
    "name":"Alpha & Omega feat. Ras Tinny",
    "startTime":"22:00",
    "endTime":"00:00",
    "stage":"Praia",
    "day":"sunday"
  },
  {
    "id":"60",
    "name":"Leafar Legov",
    "startTime":"12:00",
    "endTime":"15:00",
    "stage":"Outro Lado",
    "day":"thursday"
  },
  {
    "id":"61",
    "name":"O.Bee",
    "startTime":"15:00",
    "endTime":"18:00",
    "stage":"Outro Lado",
    "day":"thursday"
  },
  {
    "id":"62",
    "name":"Sonja Moonear",
    "startTime":"18:00",
    "endTime":"21:00",
    "stage":"Outro Lado",
    "day":"thursday"
  },
  {
    "id":"63",
    "name":"Kenny Larkin",
    "startTime":"21:00",
    "endTime":"23:00",
    "stage":"Outro Lado",
    "day":"thursday"
  },
  {
    "id":"64",
    "name":"Yamour",
    "startTime":"23:00",
    "endTime":"02:00",
    "stage":"Outro Lado",
    "day":"thursday"
  },
  {
    "id":"65",
    "name":"Mathew Jonson & .VRIL",
    "startTime":"02:00",
    "endTime":"04:00",
    "stage":"Outro Lado",
    "day":"friday"
  },
  {
    "id":"66",
    "name":"Konstantin",
    "startTime":"04:00",
    "endTime":"07:00",
    "stage":"Outro Lado",
    "day":"friday"
  },
  {
    "id":"67",
    "name":"Elli",
    "startTime":"07:00",
    "endTime":"10:00",
    "stage":"Outro Lado",
    "day":"friday"
  },
  {
    "id":"68",
    "name":"Fennesz",
    "startTime":"10:00",
    "endTime":"11:00",
    "stage":"Outro Lado",
    "day":"friday"
  },
  {
    "id":"69",
    "name":"Drama",
    "startTime":"11:00",
    "endTime":"13:00",
    "stage":"Outro Lado",
    "day":"friday"
  },
  {
    "id":"70",
    "name":"Helena Guedes",
    "startTime":"13:00",
    "endTime":"15:00",
    "stage":"Outro Lado",
    "day":"friday"
  },
  {
    "id":"71",
    "name":"UNOS",
    "startTime":"15:00",
    "endTime":"17:30",
    "stage":"Outro Lado",
    "day":"friday"
  },
  {
    "id":"72",
    "name":"Kalabrese",
    "startTime":"17:30",
    "endTime":"20:30",
    "stage":"Outro Lado",
    "day":"friday"
  },
  {
    "id":"73",
    "name":"Dj Koze",
    "startTime":"20:30",
    "endTime":"23:00",
    "stage":"Outro Lado",
    "day":"friday"
  },
  {
    "id":"74",
    "name":"DESIREE",
    "startTime":"23:00",
    "endTime":"01:30",
    "stage":"Outro Lado",
    "day":"friday"
  },
  {
    "id":"75",
    "name":"Cassy",
    "startTime":"01:30",
    "endTime":"04:00",
    "stage":"Outro Lado",
    "day":"saturday"
  },
  {
    "id":"76",
    "name":"Soundstream",
    "startTime":"04:00",
    "endTime":"07:00",
    "stage":"Outro Lado",
    "day":"saturday"
  },
  {
    "id":"77",
    "name":"Cosmo",
    "startTime":"07:00",
    "endTime":"10:00",
    "stage":"Outro Lado",
    "day":"saturday"
  },
  {
    "id":"78",
    "name":"Malibu",
    "startTime":"10:00",
    "endTime":"11:00",
    "stage":"Outro Lado",
    "day":"saturday"
  },
  {
    "id":"79",
    "name":"Gizem Öz",
    "startTime":"11:00",
    "endTime":"12:00",
    "stage":"Outro Lado",
    "day":"saturday"
  },
  {
    "id":"80",
    "name":"Rhadoo",
    "startTime":"12:00",
    "endTime":"13:00",
    "stage":"Outro Lado",
    "day":"saturday"
  },
  {
    "id":"81",
    "name":"Bochum Welt",
    "startTime":"13:00",
    "endTime":"14:00",
    "stage":"Outro Lado",
    "day":"saturday"
  },
  {
    "id":"82",
    "name":"Lowtec & Ulf Eriksson",
    "startTime":"14:00",
    "endTime":"17:00",
    "stage":"Outro Lado",
    "day":"saturday"
  },
  {
    "id":"83",
    "name":"Willow",
    "startTime":"17:00",
    "endTime":"19:00",
    "stage":"Outro Lado",
    "day":"saturday"
  },
  {
    "id":"84",
    "name":"XDB & PLO Man",
    "startTime":"19:00",
    "endTime":"22:00",
    "stage":"Outro Lado",
    "day":"saturday"
  },
  {
    "id":"85",
    "name":"Aleksi Perälä",
    "startTime":"22:00",
    "endTime":"00:00",
    "stage":"Outro Lado",
    "day":"saturday"
  },
  {
    "id":"86",
    "name":"Decoder",
    "startTime":"00:00",
    "endTime":"02:00",
    "stage":"Outro Lado",
    "day":"sunday"
  },
  {
    "id":"87",
    "name":"Cio D'Or",
    "startTime":"02:00",
    "endTime":"04:00",
    "stage":"Outro Lado",
    "day":"sunday"
  },
  {
    "id":"88",
    "name":"Serenne",
    "startTime":"04:00",
    "endTime":"06:00",
    "stage":"Outro Lado",
    "day":"sunday"
  },
  {
    "id":"89",
    "name":"Edward",
    "startTime":"06:00",
    "endTime":"09:00",
    "stage":"Outro Lado",
    "day":"sunday"
  },
  {
    "id":"90",
    "name":"BifiBoji",
    "startTime":"09:00",
    "endTime":"10:00",
    "stage":"Outro Lado",
    "day":"sunday"
  },
  {
    "id":"91",
    "name":"Hari & Achill",
    "startTime":"10:00",
    "endTime":"12:00",
    "stage":"Outro Lado",
    "day":"sunday"
  },
  {
    "id":"92",
    "name":"Pedro Ricardo",
    "startTime":"12:00",
    "endTime":"14:00",
    "stage":"Outro Lado",
    "day":"sunday"
  },
  {
    "id":"93",
    "name":"Dj Dustin",
    "startTime":"14:00",
    "endTime":"17:00",
    "stage":"Outro Lado",
    "day":"sunday"
  },
  {
    "id":"94",
    "name":"RAMZi",
    "startTime":"17:00",
    "endTime":"18:00",
    "stage":"Outro Lado",
    "day":"sunday"
  },
  {
    "id":"95",
    "name":"Petre Inspirescu",
    "startTime":"18:00",
    "endTime":"21:00",
    "stage":"Outro Lado",
    "day":"sunday"
  },
  {
    "id":"96",
    "name":"Portable",
    "startTime":"21:00",
    "endTime":"22:00",
    "stage":"Outro Lado",
    "day":"sunday"
  },
  {
    "id":"97",
    "name":"Melchior Productions Ltd.",
    "startTime":"22:00",
    "endTime":"23:00",
    "stage":"Outro Lado",
    "day":"sunday"
  },
  {
    "id":"98",
    "name":"Lawrence",
    "startTime":"23:00",
    "endTime":"00:00",
    "stage":"Outro Lado",
    "day":"sunday"
  },
  {
    "id":"99",
    "name":"Mountain People",
    "startTime":"00:00",
    "endTime":"02:00",
    "stage":"Outro Lado",
    "day":"monday"
  },
  {
    "id":"100",
    "name":"E.Lina",
    "startTime":"02:00",
    "endTime":"04:00",
    "stage":"Outro Lado",
    "day":"monday"
  },
  {
    "id":"101",
    "name":"Vera",
    "startTime":"04:00",
    "endTime":"06:00",
    "stage":"Outro Lado",
    "day":"monday"
  },
  {
    "id":"102",
    "name":"Emi",
    "startTime":"06:00",
    "endTime":"08:00",
    "stage":"Outro Lado",
    "day":"monday"
  },
  {
    "id":"103",
    "name":"Kyle Toole, Zip, Margaret Dygas, Julius Steinhoff, Sevensol,..",
    "startTime":"08:00",
    "endTime":"22:00",
    "stage":"Outro Lado",
    "day":"monday"
  },
  {
    "id":"104",
    "name":"Roderoe",
    "startTime":"21:00",
    "endTime":"22:00",
    "stage":"Mimo",
    "day":"thursday"
  },
  {
    "id":"105",
    "name":"g u i",
    "startTime":"22:00",
    "endTime":"23:30",
    "stage":"Mimo",
    "day":"thursday"
  },
  {
    "id":"106",
    "name":"lu",
    "startTime":"23:30",
    "endTime":"01:00",
    "stage":"Mimo",
    "day":"thursday"
  },
  {
    "id":"107",
    "name":"soresum (soma + rea)",
    "startTime":"01:00",
    "endTime":"04:00",
    "stage":"Mimo",
    "day":"friday"
  },
  {
    "id":"108",
    "name":"Tropa Macaca",
    "startTime":"04:00",
    "endTime":"05:00",
    "stage":"Mimo",
    "day":"friday"
  },
  {
    "id":"109",
    "name":"Mayss",
    "startTime":"05:00",
    "endTime":"08:00",
    "stage":"Mimo",
    "day":"friday"
  },
  {
    "id":"110",
    "name":"Yentl.",
    "startTime":"08:00",
    "endTime":"11:00",
    "stage":"Mimo",
    "day":"friday"
  },
  {
    "id":"111",
    "name":"PiP",
    "startTime":"11:00",
    "endTime":"11:45",
    "stage":"Mimo",
    "day":"friday"
  },
  {
    "id":"113",
    "name":"Djrum",
    "startTime":"21:00",
    "endTime":"00:00",
    "stage":"Mimo",
    "day":"friday"
  },
  {
    "id":"114",
    "name":"Eneko Zarazúa",
    "startTime":"00:00",
    "endTime":"01:00",
    "stage":"Mimo",
    "day":"saturday"
  },
  {
    "id":"115",
    "name":"carolf",
    "startTime":"01:00",
    "endTime":"03:00",
    "stage":"Mimo",
    "day":"saturday"
  },
  {
    "id":"116",
    "name":"asio otus",
    "startTime":"03:00",
    "endTime":"04:00",
    "stage":"Mimo",
    "day":"saturday"
  },
  {
    "id":"117",
    "name":"usof",
    "startTime":"04:00",
    "endTime":"05:00",
    "stage":"Mimo",
    "day":"saturday"
  },
  {
    "id":"118",
    "name":"selv ikei",
    "startTime":"05:00",
    "endTime":"06:30",
    "stage":"Mimo",
    "day":"saturday"
  },
  {
    "id":"119",
    "name":"Fenna Fiction",
    "startTime":"06:30",
    "endTime":"09:00",
    "stage":"Mimo",
    "day":"saturday"
  },
  {
    "id":"120",
    "name":"Méni",
    "startTime":"09:00",
    "endTime":"11:00",
    "stage":"Mimo",
    "day":"saturday"
  },
  {
    "id":"121",
    "name":"funcionário",
    "startTime":"11:00",
    "endTime":"12:00",
    "stage":"Mimo",
    "day":"saturday"
  },
  {
    "id":"123",
    "name":"Cole Pulice",
    "startTime":"21:00",
    "endTime":"22:00",
    "stage":"Mimo",
    "day":"saturday"
  },
  {
    "id":"124",
    "name":"Shoes Off (Planatia & Tina)",
    "startTime":"22:00",
    "endTime":"01:00",
    "stage":"Mimo",
    "day":"saturday"
  },
  {
    "id":"125",
    "name":"Gyorgy Ono",
    "startTime":"01:00",
    "endTime":"04:00",
    "stage":"Mimo",
    "day":"sunday"
  },
  {
    "id":"126",
    "name":"Vlada",
    "startTime":"04:00",
    "endTime":"06:00",
    "stage":"Mimo",
    "day":"sunday"
  },
  {
    "id":"127",
    "name":"Koodoo",
    "startTime":"06:00",
    "endTime":"08:00",
    "stage":"Mimo",
    "day":"sunday"
  },
  {
    "id":"128",
    "name":"Fred Scharf",
    "startTime":"08:00",
    "endTime":"10:00",
    "stage":"Mimo",
    "day":"sunday"
  },
  {
    "id":"129",
    "name":"Calcuta",
    "startTime":"10:00",
    "endTime":"11:00",
    "stage":"Mimo",
    "day":"sunday"
  },
  {
    "id":"130",
    "name":"Glossy Mario",
    "startTime":"11:00",
    "endTime":"13:30",
    "stage":"Mimo",
    "day":"sunday"
  },
  {
    "id":"131",
    "name":"Molero",
    "startTime":"14:00",
    "endTime":"15:00",
    "stage":"Mimo",
    "day":"sunday"
  },
  {
    "id":"132",
    "name":"Margaret Dygas",
    "startTime":"15:00",
    "endTime":"18:00",
    "stage":"Mimo",
    "day":"sunday"
  },
  {
    "id":"133",
    "name":"Edward",
    "startTime":"18:00",
    "endTime":"19:00",
    "stage":"Mimo",
    "day":"sunday"
  },
  {
    "id":"134",
    "name":"SoFa elsewhere",
    "startTime":"19:00",
    "endTime":"22:00",
    "stage":"Mimo",
    "day":"sunday"
  },
  {
    "id":"135",
    "name":"claire rousay",
    "startTime":"22:00",
    "endTime":"22:50",
    "stage":"Mimo",
    "day":"sunday"
  },
      {
    "id":"136",
    "name":"Ilhem - What emerges from the Echo",
    "startTime":"21:00",
    "endTime":"22:00",
    "stage":"Cochilo",
    "day":"wednesday"
  },
  {
    "id":"137",
    "name":"Lino Capra Vaccina",
    "startTime":"22:30",
    "endTime":"23:30",
    "stage":"Cochilo",
    "day":"wednesday"
  },
  {
    "id":"138",
    "name":"Vanishing Twin",
    "startTime":"00:00",
    "endTime":"00:50",
    "stage":"Cochilo",
    "day":"thursday"
  },
  {
    "id":"139",
    "name":"Stella & The Longos",
    "startTime":"01:20",
    "endTime":"02:20",
    "stage":"Cochilo",
    "day":"thursday"
  },
  {
    "id":"140",
    "name":"Rafael Toral",
    "startTime":"12:00",
    "endTime":"13:00",
    "stage":"Cochilo",
    "day":"thursday"
  },
  {
    "id":"141",
    "name":"Baby Smith",
    "startTime":"15:00",
    "endTime":"16:00",
    "stage":"Cochilo",
    "day":"thursday"
  },
  {
    "id":"142",
    "name":"WOW",
    "startTime":"18:00",
    "endTime":"18:45",
    "stage":"Cochilo",
    "day":"thursday"
  },
  {
    "id":"143",
    "name":"James K",
    "startTime":"21:00",
    "endTime":"22:00",
    "stage":"Cochilo",
    "day":"thursday"
  },
  {
    "id":"144",
    "name":"MAQUINA.",
    "startTime":"00:00",
    "endTime":"01:00",
    "stage":"Cochilo",
    "day":"thursday"
  },
  {
    "id":"145",
    "name":"Will Guthrie & Ensemble Nist-Nah",
    "startTime":"12:00",
    "endTime":"13:00",
    "stage":"Cochilo",
    "day":"friday"
  },
  {
    "id":"146",
    "name":"Laraaji",
    "startTime":"15:00",
    "endTime":"16:30",
    "stage":"Cochilo",
    "day":"friday"
  },
  {
    "id":"147",
    "name":"Ilusão Gótica",
    "startTime":"17:30",
    "endTime":"18:30",
    "stage":"Cochilo",
    "day":"friday"
  },
  {
    "id":"148",
    "name":"Lucy Kruger & The Lost Boys",
    "startTime":"20:00",
    "endTime":"21:00",
    "stage":"Cochilo",
    "day":"friday"
  },
  {
    "id":"149",
    "name":"Lipsync for your Waking Life",
    "startTime":"23:00",
    "endTime":"01:00",
    "stage":"Cochilo",
    "day":"friday"
  },
  {
    "id":"150",
    "name":"Greg Foat",
    "startTime":"12:00",
    "endTime":"13:00",
    "stage":"Cochilo",
    "day":"saturday"
  },
  {
    "id":"151",
    "name":"Mlin Patz",
    "startTime":"14:00",
    "endTime":"15:00",
    "stage":"Cochilo",
    "day":"saturday"
  },
  {
    "id":"152",
    "name":"Amuleto Apotropaico",
    "startTime":"16:00",
    "endTime":"17:00",
    "stage":"Cochilo",
    "day":"saturday"
  },
  {
    "id":"153",
    "name":"Hatis Noit",
    "startTime":"18:00",
    "endTime":"19:00",
    "stage":"Cochilo",
    "day":"saturday"
  },
  {
    "id":"154",
    "name":"GiGi FM presents Plastic Mermaid (hybrid live)",
    "startTime":"21:00",
    "endTime":"05:00",
    "stage":"Cochilo",
    "day":"saturday"
  },
  {
    "id":"155",
    "name":"fastmusic",
    "startTime":"12:00",
    "endTime":"13:00",
    "stage":"Cochilo",
    "day":"sunday"
  },
  {
    "id":"156",
    "name":"Tó Trips & Fake Latinos",
    "startTime":"15:00",
    "endTime":"16:00",
    "stage":"Cochilo",
    "day":"sunday"
  },
  {
    "id":"157",
    "name":"Maggie Nicols",
    "startTime":"17:30",
    "endTime":"18:30",
    "stage":"Cochilo",
    "day":"sunday"
  },
  {
    "id":"158",
    "name":"The Space Lady",
    "startTime":"20:00",
    "endTime":"21:00",
    "stage":"Cochilo",
    "day":"sunday"
  },
  {
    "id":"159",
    "name":"Nkisi presents 'Serpent Songs, Anomalous Musical Phenomena and Mystery Traditions'",
    "startTime":"23:00",
    "endTime":"23:40",
    "stage":"Cochilo",
    "day":"sunday"
  },
  {
    "id":"160",
    "name":"Samuel Rohrer",
    "startTime":"01:00",
    "endTime":"02:00",
    "stage":"Cochilo",
    "day":"monday"
  },
  {
    "id":"161",
    "name":"Petre Inspirescu (classical music set)",
    "startTime":"02:00",
    "endTime":"05:00",
    "stage":"Cochilo",
    "day":"monday"
  },
  {
    "id":"162",
    "name":"e/tape",
    "startTime":"05:00",
    "endTime":"08:00",
    "stage":"Cochilo",
    "day":"monday"
  },
  {
    "id":"163",
    "name":"Aleksi Perälä",
    "startTime":"09:00",
    "endTime":"12:00",
    "stage":"Cochilo",
    "day":"monday"
  },
  {
    "id":"164",
    "name":"Wilson Tanner",
    "startTime":"13:00",
    "endTime":"14:00",
    "stage":"Cochilo",
    "day":"monday"
  },
  {
    "id":"165",
    "name":"Indonesia National Orchestra",
    "startTime":"15:00",
    "endTime":"16:00",
    "stage":"Cochilo",
    "day":"monday"
  },
  {
    "id":"166",
    "name":"Ballaké Sissoko",
    "startTime":"17:00",
    "endTime":"18:10",
    "stage":"Cochilo",
    "day":"monday"
  },
  {
    "id":"167",
    "name":"FUJI||||||||||TA",
    "startTime":"21:00",
    "endTime":"22:00",
    "stage":"Cochilo",
    "day":"monday"
  },
  {
    "id":"168",
    "name":"Refree",
    "startTime":"22:00",
    "endTime":"23:00",
    "stage":"Cochilo",
    "day":"monday"
  }
])
  
